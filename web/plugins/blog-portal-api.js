/* global Buffer, process */

import path from 'node:path';
import { loadBlogPosts, writeBlogImageFile, writeBlogPostFile } from '../tools/blog-storage.js';
import { BLOG_IMAGE_MAX_BYTES, normalizeBlogImageName } from '../src/content/blog/imageConfig.js';
import { BLOG_STATUSES } from '../src/content/blog/blogSchema.js';
import { transitionBlogPost } from '../src/content/blog/blogWorkflow.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { BLOG_PORTAL_API_PREFIX } from '../src/content/blog/portalConfig.js';

const MAX_POST_BYTES = 2 * 1024 * 1024;

function isLoopbackRequest(request) {
  const address = request.socket?.remoteAddress?.replace('::ffff:', '');
  return address === '127.0.0.1' || address === '::1';
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function readRequestBody(request, maximumBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    request.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maximumBytes) {
        reject(new Error('Request is too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function safeImageName(value) {
  return normalizeBlogImageName(value);
}

function saveImage(name, contents) {
  return writeBlogImageFile(name, contents);
}

function storageOptions(status) {
  return {
    mode: status === BLOG_STATUSES.PUBLISHED ? 'publish' : 'draft',
    validRouteIds: INDEXABLE_ROUTES.map((route) => route.id),
    validRoutePaths: INDEXABLE_ROUTES.map((route) => route.path),
    validRoutes: INDEXABLE_ROUTES,
  };
}

function postIdFromWorkflowPath(pathname) {
  const prefix = `${BLOG_PORTAL_API_PREFIX}/posts/`;
  if (!pathname.startsWith(prefix) || !pathname.endsWith('/workflow')) return null;
  const encodedId = pathname.slice(prefix.length, -'/workflow'.length);
  if (!encodedId || encodedId.includes('/')) return null;
  return decodeURIComponent(encodedId);
}

export default function blogPortalApiPlugin() {
  return {
    name: 'centaur-blog-portal-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url || '/', 'http://localhost');
        if (!requestUrl.pathname.startsWith(BLOG_PORTAL_API_PREFIX)) {
          next();
          return;
        }

        if (!isLoopbackRequest(request)) {
          sendJson(response, 403, { error: 'The local blog portal is available only from this computer.' });
          return;
        }

        try {
          if (request.method === 'GET' && requestUrl.pathname === `${BLOG_PORTAL_API_PREFIX}/posts`) {
            sendJson(response, 200, { posts: loadBlogPosts() });
            return;
          }

          if (request.method === 'POST' && requestUrl.pathname === `${BLOG_PORTAL_API_PREFIX}/posts`) {
            const contents = await readRequestBody(request, MAX_POST_BYTES);
            const payload = JSON.parse(contents.toString('utf8'));
            const post = payload.post || payload;
            const existingPost = loadBlogPosts().find((candidate) => candidate.id === post.id);
            if (!existingPost && post.status !== BLOG_STATUSES.DRAFT) {
              throw new Error('Save a new post as draft before using a publishing workflow action');
            }
            if (existingPost && existingPost.status !== post.status) {
              throw new Error('Use an explicit publishing workflow action to change the post status');
            }
            const destination = writeBlogPostFile(post, storageOptions(post.status));
            sendJson(response, 200, {
              id: post.id,
              file: path.relative(process.cwd(), destination).split(path.sep).join('/'),
            });
            return;
          }

          const workflowPostId = postIdFromWorkflowPath(requestUrl.pathname);
          if (request.method === 'POST' && workflowPostId) {
            const contents = await readRequestBody(request, MAX_POST_BYTES);
            const payload = JSON.parse(contents.toString('utf8'));
            const targetStatus = payload.targetStatus;
            const existingPost = loadBlogPosts().find((candidate) => candidate.id === workflowPostId);
            if (!existingPost) throw new Error(`Blog post not found: ${workflowPostId}`);
            const candidate = payload.post || existingPost;
            if (candidate.id !== existingPost.id || candidate.status !== existingPost.status) {
              throw new Error('The workflow record is stale. Reload the post before changing its status');
            }
            const transitionedPost = transitionBlogPost(candidate, targetStatus, {
              scheduledAt: payload.scheduledAt,
            });
            const destination = writeBlogPostFile(transitionedPost, storageOptions(transitionedPost.status));
            sendJson(response, 200, {
              id: transitionedPost.id,
              post: transitionedPost,
              file: path.relative(process.cwd(), destination).split(path.sep).join('/'),
            });
            return;
          }

          if (request.method === 'POST' && requestUrl.pathname === `${BLOG_PORTAL_API_PREFIX}/images`) {
            const imageName = safeImageName(request.headers['x-blog-image-name']);
            const contents = await readRequestBody(request, BLOG_IMAGE_MAX_BYTES);
            if (contents.length === 0) throw new Error('The image file is empty');
            const image = saveImage(imageName, contents);
            sendJson(response, 200, { src: image.src, image });
            return;
          }

          sendJson(response, 404, { error: 'Unknown local blog portal endpoint' });
        } catch (error) {
          sendJson(response, 400, { error: error instanceof Error ? error.message : 'Local blog portal request failed' });
        }
      });
    },
  };
}
