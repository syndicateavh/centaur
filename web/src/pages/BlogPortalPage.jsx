import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  FileJson,
  Import,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { BLOG_BLOCK_TYPES, BLOG_CATEGORIES, BLOG_STATUSES, BLOG_SCHEMA_VERSION } from '@/content/blog/blogSchema.js';
import { validateBlogPostForEditorialUse } from '@/content/blog/blogValidation.js';
import { getWorkflowActionLabel, getWorkflowTransitions } from '@/content/blog/blogWorkflow.js';
import { BLOG_PORTAL_API_PREFIX, BLOG_PORTAL_DRAFT_STORAGE_KEY } from '@/content/blog/portalConfig.js';
import { BLOG_IMAGE_MAX_BYTES, BLOG_IMAGE_MIME_TYPES, createBlogImageName, getBlogImageExtension } from '@/content/blog/imageConfig.js';
import { INDEXABLE_ROUTES } from '@/seo/seoRoutes.js';

const TODAY = new Date().toISOString().slice(0, 10);
const ROUTE_IDS = INDEXABLE_ROUTES.map((route) => route.id);
const STATUS_OPTIONS = Object.values(BLOG_STATUSES);
const BLOCK_OPTIONS = Object.values(BLOG_BLOCK_TYPES);
const IMAGE_DEFAULTS = { src: '', alt: '', width: 1200, height: 630 };

function createInitialPost() {
  return {
    schemaVersion: BLOG_SCHEMA_VERSION,
    id: 'new-blog-post',
    slug: 'new-blog-post',
    status: BLOG_STATUSES.DRAFT,
    title: '',
    excerpt: '',
    category: BLOG_CATEGORIES[0],
    author: { id: '', name: '', role: '', profilePath: undefined },
    body: [{ type: BLOG_BLOCK_TYPES.PARAGRAPH, text: '' }],
    coverImage: null,
    publishedAt: null,
    updatedAt: TODAY,
    scheduledAt: null,
    seo: { title: '', description: '', canonicalPath: '/blog/new-blog-post/', noindex: true },
    relatedRouteIds: [],
    redirects: [],
    evidenceNotes: [],
  };
}

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function displayLabel(value) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function splitLines(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function defaultBlock(type) {
  switch (type) {
    case BLOG_BLOCK_TYPES.HEADING:
      return { type, level: 2, text: '' };
    case BLOG_BLOCK_TYPES.LIST:
      return { type, ordered: false, items: [''] };
    case BLOG_BLOCK_TYPES.QUOTE:
      return { type, text: '', cite: undefined };
    case BLOG_BLOCK_TYPES.LINK:
      return { type, label: '', href: '', routeId: undefined };
    case BLOG_BLOCK_TYPES.IMAGE:
      return { type, image: copy(IMAGE_DEFAULTS) };
    case BLOG_BLOCK_TYPES.FAQ:
      return { type, question: '', answer: '' };
    case BLOG_BLOCK_TYPES.CALLOUT:
      return { type, title: '', text: '' };
    case BLOG_BLOCK_TYPES.PARAGRAPH:
    default:
      return { type: BLOG_BLOCK_TYPES.PARAGRAPH, text: '' };
  }
}

function Field({ label, htmlFor, help, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-bold text-primary">{label}</label>
      {children}
      {help && <p className="text-xs leading-relaxed text-muted-foreground">{help}</p>}
    </div>
  );
}

function TextInput({ id, value, onChange, placeholder, type = 'text', disabled = false }) {
  return (
    <input
      id={id}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-primary shadow-sm disabled:cursor-not-allowed disabled:bg-muted"
    />
  );
}

function TextArea({ id, value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      id={id}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border bg-white px-3 py-2 text-sm leading-relaxed text-primary shadow-sm"
    />
  );
}

function ImageFields({ idPrefix, image, onChange, onUpload, uploading }) {
  const value = image || IMAGE_DEFAULTS;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <Field label="Image source" htmlFor={`${idPrefix}-src`} help="Use a site-relative path such as /images/blog/example.webp. Uploaded image dimensions are filled automatically.">
          <TextInput id={`${idPrefix}-src`} value={value.src} onChange={(event) => onChange({ ...value, src: event.target.value })} placeholder="/images/blog/example.webp" />
        </Field>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-bold text-primary hover:bg-muted">
          <Upload className="h-4 w-4" aria-hidden="true" />
          {uploading ? 'Uploading…' : 'Upload local image'}
          <input
            type="file"
            accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const [file] = event.target.files || [];
              if (file) onUpload(file, (imageDetails) => onChange({ ...value, ...imageDetails }));
              event.target.value = '';
            }}
          />
        </label>
      </div>
      <Field label="Alt text" htmlFor={`${idPrefix}-alt`} help="Describe the image for people who cannot see it.">
        <TextInput id={`${idPrefix}-alt`} value={value.alt} onChange={(event) => onChange({ ...value, alt: event.target.value })} placeholder="Describe the image" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Width" htmlFor={`${idPrefix}-width`}>
          <TextInput id={`${idPrefix}-width`} type="number" value={value.width} onChange={(event) => onChange({ ...value, width: Number(event.target.value) })} />
        </Field>
        <Field label="Height" htmlFor={`${idPrefix}-height`}>
          <TextInput id={`${idPrefix}-height`} type="number" value={value.height} onChange={(event) => onChange({ ...value, height: Number(event.target.value) })} />
        </Field>
      </div>
      {image && (
        <button type="button" onClick={() => onChange(null)} className="text-sm font-bold text-red-700 underline underline-offset-2">
          Remove image
        </button>
      )}
    </div>
  );
}

function BlockEditor({ block, index, onChange, onRemove, onUpload, uploading }) {
  function changeType(type) {
    onChange(index, { ...defaultBlock(type), type });
  }

  function update(fields) {
    onChange(index, { ...block, ...fields });
  }

  return (
    <fieldset className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
      <legend className="px-2 text-sm font-bold text-primary">Block {index + 1}</legend>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Block type" htmlFor={`block-${index}-type`}>
          <select id={`block-${index}-type`} value={block.type} onChange={(event) => changeType(event.target.value)} className="min-h-11 rounded-lg border bg-white px-3 py-2 text-sm text-primary">
            {BLOCK_OPTIONS.map((type) => <option key={type} value={type}>{displayLabel(type)}</option>)}
          </select>
        </Field>
        <button type="button" onClick={() => onRemove(index)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Remove
        </button>
      </div>

      {block.type === BLOG_BLOCK_TYPES.PARAGRAPH && (
        <Field label="Paragraph text" htmlFor={`block-${index}-text`}>
          <TextArea id={`block-${index}-text`} value={block.text} onChange={(event) => update({ text: event.target.value })} rows={5} />
        </Field>
      )}

      {block.type === BLOG_BLOCK_TYPES.HEADING && (
        <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
          <Field label="Level" htmlFor={`block-${index}-level`}>
            <select id={`block-${index}-level`} value={block.level} onChange={(event) => update({ level: Number(event.target.value) })} className="min-h-11 rounded-lg border bg-white px-3 py-2 text-sm text-primary">
              <option value="2">H2</option>
              <option value="3">H3</option>
            </select>
          </Field>
          <Field label="Heading text" htmlFor={`block-${index}-text`}>
            <TextInput id={`block-${index}-text`} value={block.text} onChange={(event) => update({ text: event.target.value })} />
          </Field>
        </div>
      )}

      {block.type === BLOG_BLOCK_TYPES.LIST && (
        <div className="space-y-3">
          <label className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            <input type="checkbox" checked={Boolean(block.ordered)} onChange={(event) => update({ ordered: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" />
            Ordered list
          </label>
          <Field label="List items" htmlFor={`block-${index}-items`} help="Use one item per line.">
            <TextArea id={`block-${index}-items`} value={(block.items || []).join('\n')} onChange={(event) => update({ items: event.target.value.split('\n') })} rows={5} />
          </Field>
        </div>
      )}

      {block.type === BLOG_BLOCK_TYPES.QUOTE && (
        <div className="space-y-3">
          <Field label="Quote" htmlFor={`block-${index}-text`}><TextArea id={`block-${index}-text`} value={block.text} onChange={(event) => update({ text: event.target.value })} /></Field>
          <Field label="Attribution" htmlFor={`block-${index}-cite`}><TextInput id={`block-${index}-cite`} value={block.cite} onChange={(event) => update({ cite: event.target.value || undefined })} /></Field>
        </div>
      )}

      {block.type === BLOG_BLOCK_TYPES.LINK && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Link label" htmlFor={`block-${index}-label`}><TextInput id={`block-${index}-label`} value={block.label} onChange={(event) => update({ label: event.target.value })} /></Field>
            <Field label="URL" htmlFor={`block-${index}-href`}><TextInput id={`block-${index}-href`} value={block.href} onChange={(event) => update({ href: event.target.value })} placeholder="/courses/" /></Field>
          </div>
          <Field label="Related route" htmlFor={`block-${index}-route`} help="Optional route ID for internal-link validation.">
            <select id={`block-${index}-route`} value={block.routeId || ''} onChange={(event) => update({ routeId: event.target.value || undefined })} className="min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-primary">
              <option value="">No related route</option>
              {INDEXABLE_ROUTES.map((route) => <option key={route.id} value={route.id}>{route.id} — {route.path}</option>)}
            </select>
          </Field>
        </div>
      )}

      {block.type === BLOG_BLOCK_TYPES.IMAGE && (
        <ImageFields idPrefix={`block-${index}-image`} image={block.image} onChange={(image) => update({ image })} onUpload={(file, applyImage) => onUpload(file, applyImage, `block-${index}`)} uploading={uploading === `block-${index}`} />
      )}

      {block.type === BLOG_BLOCK_TYPES.FAQ && (
        <div className="space-y-3">
          <Field label="Question" htmlFor={`block-${index}-question`}><TextInput id={`block-${index}-question`} value={block.question} onChange={(event) => update({ question: event.target.value })} /></Field>
          <Field label="Answer" htmlFor={`block-${index}-answer`}><TextArea id={`block-${index}-answer`} value={block.answer} onChange={(event) => update({ answer: event.target.value })} rows={5} /></Field>
        </div>
      )}

      {block.type === BLOG_BLOCK_TYPES.CALLOUT && (
        <div className="space-y-3">
          <Field label="Callout title" htmlFor={`block-${index}-title`}><TextInput id={`block-${index}-title`} value={block.title} onChange={(event) => update({ title: event.target.value })} /></Field>
          <Field label="Callout text" htmlFor={`block-${index}-text`}><TextArea id={`block-${index}-text`} value={block.text} onChange={(event) => update({ text: event.target.value })} /></Field>
        </div>
      )}
    </fieldset>
  );
}

function BlogPreview({ post }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      {post.coverImage?.src && <img src={post.coverImage.src} alt={post.coverImage.alt || ''} width={post.coverImage.width} height={post.coverImage.height} className="aspect-[16/7] w-full object-cover" />}
      <div className="p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{displayLabel(post.category || 'blog post')}</p>
        <h2 className="mt-3 text-3xl font-black text-primary">{post.title || 'Your article title'}</h2>
        <p className="mt-3 text-muted-foreground">{post.excerpt || 'Your article excerpt will appear here.'}</p>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-foreground/80">
          {(post.body || []).map((block, index) => {
            if (block.type === BLOG_BLOCK_TYPES.HEADING) {
              return block.level === 3 ? <h4 key={index} className="text-xl font-bold text-primary">{block.text || 'Heading'}</h4> : <h3 key={index} className="text-2xl font-bold text-primary">{block.text || 'Heading'}</h3>;
            }
            if (block.type === BLOG_BLOCK_TYPES.LIST) {
              const List = block.ordered ? 'ol' : 'ul';
              return <List key={index} className={`${block.ordered ? 'list-decimal' : 'list-disc'} ml-5 space-y-1`}>{(block.items || []).map((item, itemIndex) => <li key={itemIndex}>{item || 'List item'}</li>)}</List>;
            }
            if (block.type === BLOG_BLOCK_TYPES.QUOTE) return <blockquote key={index} className="border-l-4 border-accent pl-4 italic">{block.text || 'Quote'}{block.cite && <cite className="mt-2 block not-italic">— {block.cite}</cite>}</blockquote>;
            if (block.type === BLOG_BLOCK_TYPES.LINK) return <p key={index}><a href={block.href || '#'} className="font-bold text-primary underline underline-offset-4">{block.label || 'Link'}</a></p>;
            if (block.type === BLOG_BLOCK_TYPES.IMAGE) return block.image?.src ? <img key={index} src={block.image.src} alt={block.image.alt || ''} width={block.image.width} height={block.image.height} className="h-auto w-full rounded-xl" /> : null;
            if (block.type === BLOG_BLOCK_TYPES.FAQ) return <div key={index}><h3 className="font-bold text-primary">{block.question || 'Question'}</h3><p className="mt-1">{block.answer || 'Answer'}</p></div>;
            if (block.type === BLOG_BLOCK_TYPES.CALLOUT) return <aside key={index} className="rounded-xl bg-muted p-4"><h3 className="font-bold text-primary">{block.title || 'Callout'}</h3><p className="mt-1">{block.text || 'Supporting information'}</p></aside>;
            return <p key={index}>{block.text || 'Paragraph text'}</p>;
          })}
        </div>
      </div>
    </article>
  );
}

function validationMode(post) {
  return post.status === BLOG_STATUSES.PUBLISHED ? 'publish' : 'draft';
}

function PortalStatus({ children, tone = 'muted' }) {
  const classes = tone === 'success'
    ? 'border-green-200 bg-green-50 text-green-800'
    : tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-border bg-white text-muted-foreground';
  return <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${classes}`}>{children}</div>;
}

export default function BlogPortalPage() {
  const [post, setPost] = useState(createInitialPost);
  const [posts, setPosts] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [isLocal, setIsLocal] = useState(true);
  const importInput = useRef(null);

  const currentValidation = useMemo(() => validateBlogPostForEditorialUse(post, {
    mode: validationMode(post),
    validRouteIds: ROUTE_IDS,
    validRoutePaths: INDEXABLE_ROUTES.map((route) => route.path),
    validRoutes: INDEXABLE_ROUTES,
  }), [post]);
  const workflowTargets = useMemo(() => getWorkflowTransitions(post.status), [post.status]);
  const postIsStored = posts.some((candidate) => candidate.id === post.id);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hostname = window.location.hostname;
    setIsLocal(['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname));
    try {
      const saved = window.localStorage.getItem(BLOG_PORTAL_DRAFT_STORAGE_KEY);
      if (saved) setPost(JSON.parse(saved));
    } catch {
      setNotice({ tone: 'error', text: 'The saved browser draft could not be read.' });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(BLOG_PORTAL_DRAFT_STORAGE_KEY, JSON.stringify(post));
  }, [post]);

  async function refreshPosts() {
    setLoading(true);
    try {
      const response = await fetch(`${BLOG_PORTAL_API_PREFIX}/posts`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Local storage endpoint is unavailable');
      const payload = await response.json();
      setPosts(payload.posts || []);
      setNotice(null);
    } catch {
      setNotice({ tone: 'muted', text: 'Run npm run dev on this computer to list and save repository files. Export JSON remains available.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshPosts();
  }, []);

  function updatePost(fields) {
    setPost((current) => ({ ...current, ...fields }));
    setNotice(null);
  }

  function updateSlug(value) {
    const slug = slugify(value);
    setPost((current) => ({ ...current, slug, id: current.id === current.slug || current.id === 'new-blog-post' ? slug : current.id, seo: { ...current.seo, canonicalPath: `/blog/${slug}/` } }));
    setNotice(null);
  }

  function updateAuthor(fields) {
    setPost((current) => ({ ...current, author: { ...current.author, ...fields } }));
  }

  function updateSeo(fields) {
    setPost((current) => ({ ...current, seo: { ...current.seo, ...fields } }));
  }

  function updateBlock(index, fields) {
    setPost((current) => ({ ...current, body: current.body.map((block, blockIndex) => blockIndex === index ? fields : block) }));
  }

  function removeBlock(index) {
    setPost((current) => ({ ...current, body: current.body.filter((_, blockIndex) => blockIndex !== index) }));
  }

  function toggleRoute(routeId) {
    setPost((current) => {
      const relatedRouteIds = current.relatedRouteIds.includes(routeId)
        ? current.relatedRouteIds.filter((id) => id !== routeId)
        : [...current.relatedRouteIds, routeId];
      return { ...current, relatedRouteIds };
    });
  }

  async function uploadImage(file, applyImage, uploadKey = file.name) {
    const extension = getBlogImageExtension(file.name);
    if (!extension) {
      setNotice({ tone: 'error', text: 'Choose an AVIF, GIF, JPEG, PNG, or WebP image.' });
      return;
    }
    if (file.size > BLOG_IMAGE_MAX_BYTES) {
      setNotice({ tone: 'error', text: `Images must be ${Math.floor(BLOG_IMAGE_MAX_BYTES / (1024 * 1024))} MB or smaller.` });
      return;
    }
    if (file.type && file.type !== BLOG_IMAGE_MIME_TYPES[extension]) {
      setNotice({ tone: 'error', text: 'The image extension and browser-reported image type do not match.' });
      return;
    }
    const imageName = createBlogImageName(file.name);
    setUploading(uploadKey);
    try {
      const response = await fetch(`${BLOG_PORTAL_API_PREFIX}/images`, { method: 'POST', headers: { 'X-Blog-Image-Name': imageName, 'Content-Type': BLOG_IMAGE_MIME_TYPES[extension] }, body: file });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Image upload failed');
      const uploadedImage = payload.image || { src: payload.src };
      applyImage({
        src: uploadedImage.src,
        ...(uploadedImage.width ? { width: uploadedImage.width } : {}),
        ...(uploadedImage.height ? { height: uploadedImage.height } : {}),
      });
      setNotice({ tone: 'success', text: `Image saved to ${payload.src}` });
    } catch {
      setNotice({ tone: 'error', text: 'Image upload is available while the local development server is running. You can enter a public image path instead.' });
    } finally {
      setUploading(null);
    }
  }

  function startNewPost() {
    setPost(createInitialPost());
    setNotice(null);
  }

  function selectPost(id) {
    const selected = posts.find((candidate) => candidate.id === id);
    if (selected) {
      setPost(copy(selected));
      setNotice(null);
    }
  }

  async function importPost(event) {
    const [file] = event.target.files || [];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      setPost(imported);
      const importedValidation = validateBlogPostForEditorialUse(imported, {
        mode: validationMode(imported),
        validRouteIds: ROUTE_IDS,
        validRoutePaths: INDEXABLE_ROUTES.map((route) => route.path),
        validRoutes: INDEXABLE_ROUTES,
      });
      setNotice({ tone: importedValidation.errors.length > 0 ? 'error' : 'success', text: importedValidation.errors.length > 0 ? 'JSON imported. Resolve the validation messages before saving.' : 'JSON imported and ready to edit.' });
    } catch {
      setNotice({ tone: 'error', text: 'The selected file is not valid blog JSON.' });
    }
  }

  function exportPost() {
    const filename = `${post.id || 'blog-post'}.json`;
    const blob = new Blob([`${JSON.stringify(post, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice({ tone: 'success', text: `Downloaded ${filename}. Place it under src/content/blog/posts/.` });
  }

  async function savePost(event) {
    event.preventDefault();
    const candidate = { ...post, updatedAt: TODAY };
    const validation = validateBlogPostForEditorialUse(candidate, {
      mode: validationMode(candidate),
      validRouteIds: ROUTE_IDS,
      validRoutePaths: INDEXABLE_ROUTES.map((route) => route.path),
      validRoutes: INDEXABLE_ROUTES,
    });
    if (validation.errors.length > 0) {
      setNotice({ tone: 'error', text: 'Resolve the validation messages before saving.' });
      return;
    }
    if (!isLocal) {
      setNotice({ tone: 'muted', text: 'This portal can save repository files only from localhost. Use Export JSON on another host.' });
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${BLOG_PORTAL_API_PREFIX}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post: candidate }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Post save failed');
      setPost(candidate);
      setNotice({ tone: 'success', text: `Saved ${payload.file}.` });
      await refreshPosts();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'The local save endpoint is unavailable. Use Export JSON.' });
    } finally {
      setBusy(false);
    }
  }

  async function transitionWorkflow(targetStatus) {
    if (!isLocal) {
      setNotice({ tone: 'muted', text: 'Publishing workflow actions are available only from localhost. Use Export JSON on another host.' });
      return;
    }
    if (!postIsStored) {
      setNotice({ tone: 'error', text: 'Save this record as a draft before using a publishing workflow action.' });
      return;
    }
    setBusy(true);
    try {
      const candidate = { ...post, updatedAt: TODAY };
      const response = await fetch(`${BLOG_PORTAL_API_PREFIX}/posts/${encodeURIComponent(post.id)}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: candidate, targetStatus, scheduledAt: candidate.scheduledAt }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Publishing workflow action failed');
      setPost(payload.post || candidate);
      setNotice({ tone: 'success', text: `${getWorkflowActionLabel(targetStatus)} completed. Saved ${payload.file}.` });
      await refreshPosts();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'The publishing workflow action failed.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-muted/50 py-10 sm:py-14">
      <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-2xl bg-navy-gradient p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Local editor</p>
              <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Blog portal</h1>
              <p className="mt-4 max-w-3xl text-white/75">Create and validate structured blog records for the in-house file storage workflow.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={startNewPost} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary"><Plus className="h-4 w-4" aria-hidden="true" />New post</button>
              <button type="button" onClick={() => importInput.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"><Import className="h-4 w-4" aria-hidden="true" />Import JSON</button>
              <input ref={importInput} type="file" accept="application/json,.json" onChange={importPost} className="sr-only" aria-label="Import blog JSON" />
              <button type="button" onClick={exportPost} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"><Download className="h-4 w-4" aria-hidden="true" />Export JSON</button>
            </div>
          </div>
        </header>

        {!isLocal && <PortalStatus>Repository saving is disabled on this host. Run the portal at localhost for file writes; export is still available.</PortalStatus>}
        {notice && <div className="mt-4"><PortalStatus tone={notice.tone}>{notice.text}</PortalStatus></div>}

        <div className="mt-6 grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)_minmax(20rem,28rem)]">
          <aside className="h-fit rounded-2xl border bg-white p-4 shadow-sm xl:sticky xl:top-6" aria-label="Stored blog posts">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-primary">Stored posts</h2>
              <button type="button" onClick={refreshPosts} className="rounded-lg p-2 text-primary hover:bg-muted" aria-label="Refresh stored posts" title="Refresh stored posts"><RefreshCw className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : posts.length === 0 ? <p className="mt-4 text-sm leading-relaxed text-muted-foreground">No saved records yet. Start a post or import an existing JSON file.</p> : (
              <ul className="mt-4 space-y-2">
                {posts.map((candidate) => (
                  <li key={candidate.id}>
                    <button type="button" onClick={() => selectPost(candidate.id)} className={`w-full rounded-lg border px-3 py-3 text-left ${candidate.id === post.id ? 'border-accent bg-accent/10' : 'bg-white hover:bg-muted'}`}>
                      <span className="block truncate text-sm font-bold text-primary">{candidate.title || candidate.slug}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{displayLabel(candidate.status)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <form onSubmit={savePost} className="space-y-6">
            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" aria-labelledby="post-details-title">
              <div className="mb-6 flex items-start justify-between gap-4"><div><p className="eyebrow">Record</p><h2 id="post-details-title" className="mt-2 text-2xl font-bold text-primary">Post details</h2></div><FileJson className="h-7 w-7 text-accent" aria-hidden="true" /></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Stable ID" htmlFor="post-id" help="The filename identity. It is not changed when a public slug changes."><TextInput id="post-id" value={post.id} disabled /></Field>
                <Field label="Public slug" htmlFor="post-slug" help="This becomes /blog/{post.slug || 'your-slug'}/."><TextInput id="post-slug" value={post.slug} onChange={(event) => updateSlug(event.target.value)} /></Field>
                <Field label="Status" htmlFor="post-status" help="Use the publishing workflow actions below to change status."><select id="post-status" value={post.status} disabled className="min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-primary disabled:cursor-not-allowed disabled:bg-muted">{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{displayLabel(status)}</option>)}</select></Field>
                <Field label="Category" htmlFor="post-category"><select id="post-category" value={post.category} onChange={(event) => updatePost({ category: event.target.value })} className="min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-primary">{BLOG_CATEGORIES.map((category) => <option key={category} value={category}>{displayLabel(category)}</option>)}</select></Field>
              </div>
              <div className="mt-5 space-y-5">
                <Field label="Title" htmlFor="post-title"><TextInput id="post-title" value={post.title} onChange={(event) => updatePost({ title: event.target.value })} /></Field>
                <Field label="Excerpt" htmlFor="post-excerpt" help="Used for listings and as the default description source."><TextArea id="post-excerpt" value={post.excerpt} onChange={(event) => updatePost({ excerpt: event.target.value })} rows={4} /></Field>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" aria-labelledby="author-title">
              <p className="eyebrow">Attribution</p><h2 id="author-title" className="mt-2 text-2xl font-bold text-primary">Author</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Author ID" htmlFor="author-id"><TextInput id="author-id" value={post.author.id} onChange={(event) => updateAuthor({ id: slugify(event.target.value) })} /></Field>
                <Field label="Author name" htmlFor="author-name"><TextInput id="author-name" value={post.author.name} onChange={(event) => updateAuthor({ name: event.target.value })} /></Field>
                <Field label="Author role" htmlFor="author-role"><TextInput id="author-role" value={post.author.role} onChange={(event) => updateAuthor({ role: event.target.value })} /></Field>
                <Field label="Profile path" htmlFor="author-profile" help="Optional site-relative path."><TextInput id="author-profile" value={post.author.profilePath} onChange={(event) => updateAuthor({ profilePath: event.target.value || undefined })} placeholder="/about/" /></Field>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" aria-labelledby="dates-title">
              <p className="eyebrow">Editorial lifecycle</p><h2 id="dates-title" className="mt-2 text-2xl font-bold text-primary">Dates and index state</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <Field label="Published date" htmlFor="published-at"><TextInput id="published-at" type="date" value={post.publishedAt || ''} onChange={(event) => updatePost({ publishedAt: event.target.value || null })} /></Field>
                <Field label="Scheduled date" htmlFor="scheduled-at"><TextInput id="scheduled-at" type="date" value={post.scheduledAt || ''} onChange={(event) => updatePost({ scheduledAt: event.target.value || null })} /></Field>
                <Field label="Updated date" htmlFor="updated-at"><TextInput id="updated-at" type="date" value={post.updatedAt || ''} onChange={(event) => updatePost({ updatedAt: event.target.value })} /></Field>
              </div>
              <label className="mt-5 inline-flex items-center gap-3 text-sm font-bold text-primary"><input type="checkbox" checked={Boolean(post.seo.noindex)} onChange={(event) => updateSeo({ noindex: event.target.checked })} className="h-4 w-4 accent-[hsl(var(--accent))]" />Keep this post out of search indexes</label>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" aria-labelledby="workflow-title">
              <p className="eyebrow">Publishing workflow</p><h2 id="workflow-title" className="mt-2 text-2xl font-bold text-primary">Controlled status actions</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Save the record first, then use an allowed workflow action. Publishing runs the same validation used by the production build.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-muted px-3 py-2 text-sm font-bold text-primary">Current: {displayLabel(post.status)}</span>
                {!postIsStored && <span className="text-sm text-muted-foreground">Save as draft to enable workflow actions.</span>}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {workflowTargets.map((targetStatus) => (
                  <button key={targetStatus} type="button" onClick={() => transitionWorkflow(targetStatus)} disabled={busy || !postIsStored || !isLocal} className="min-h-11 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-bold text-primary hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
                    {getWorkflowActionLabel(targetStatus)}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" aria-labelledby="seo-title">
              <p className="eyebrow">Search metadata</p><h2 id="seo-title" className="mt-2 text-2xl font-bold text-primary">SEO fields</h2>
              <div className="mt-5 space-y-5">
                <Field label="SEO title" htmlFor="seo-title-input"><TextInput id="seo-title-input" value={post.seo.title} onChange={(event) => updateSeo({ title: event.target.value })} /></Field>
                <Field label="SEO description" htmlFor="seo-description"><TextArea id="seo-description" value={post.seo.description} onChange={(event) => updateSeo({ description: event.target.value })} rows={4} /></Field>
                <Field label="Canonical path" htmlFor="canonical-path" help="This must match /blog/{post.slug || 'your-slug'}/."><TextInput id="canonical-path" value={post.seo.canonicalPath} onChange={(event) => updateSeo({ canonicalPath: event.target.value })} /></Field>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" aria-labelledby="image-title">
              <p className="eyebrow">Media</p><h2 id="image-title" className="mt-2 text-2xl font-bold text-primary">Cover image</h2>
              <div className="mt-5"><ImageFields idPrefix="cover" image={post.coverImage} onChange={(coverImage) => updatePost({ coverImage })} onUpload={(file, applyImage) => uploadImage(file, applyImage, 'cover')} uploading={uploading === 'cover'} /></div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" aria-labelledby="links-title">
              <p className="eyebrow">Context</p><h2 id="links-title" className="mt-2 text-2xl font-bold text-primary">Related website pages</h2>
              <p className="mt-3 text-sm text-muted-foreground">Select relevant existing pages for contextual internal links.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {INDEXABLE_ROUTES.map((route) => <label key={route.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={post.relatedRouteIds.includes(route.id)} onChange={() => toggleRoute(route.id)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--accent))]" /><span><span className="block font-bold text-primary">{route.id}</span><span className="text-muted-foreground">{route.path}</span></span></label>)}
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Redirect paths" htmlFor="redirects" help="One former site-relative path per line."><TextArea id="redirects" value={(post.redirects || []).join('\n')} onChange={(event) => updatePost({ redirects: splitLines(event.target.value) })} rows={4} /></Field>
                <Field label="Evidence notes" htmlFor="evidence-notes" help="Editorial provenance notes; not public body copy."><TextArea id="evidence-notes" value={(post.evidenceNotes || []).join('\n')} onChange={(event) => updatePost({ evidenceNotes: splitLines(event.target.value) })} rows={4} /></Field>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" aria-labelledby="body-title">
              <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Structured content</p><h2 id="body-title" className="mt-2 text-2xl font-bold text-primary">Body blocks</h2></div><button type="button" onClick={() => setPost((current) => ({ ...current, body: [...current.body, defaultBlock(BLOG_BLOCK_TYPES.PARAGRAPH)] }))} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" aria-hidden="true" />Add paragraph</button></div>
              <div className="mt-5 space-y-4">{post.body.map((block, index) => <BlockEditor key={`${index}-${block.type}`} block={block} index={index} onChange={updateBlock} onRemove={removeBlock} onUpload={uploadImage} uploading={uploading} />)}</div>
            </section>

            {currentValidation.errors.length > 0 && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><p className="font-bold">Validation messages</p><ul className="mt-2 list-disc space-y-1 pl-5">{currentValidation.errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
            {currentValidation.warnings.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-bold">Editorial recommendations</p><ul className="mt-2 list-disc space-y-1 pl-5">{currentValidation.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-muted-foreground">{currentValidation.errors.length === 0 ? `This record is valid for its current status (${currentValidation.metrics.wordCount} body words).` : `${currentValidation.errors.length} validation message${currentValidation.errors.length === 1 ? '' : 's'} to resolve.`}</p><button type="submit" disabled={busy} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-primary disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" aria-hidden="true" />{busy ? 'Saving…' : 'Validate and save'}</button></div>
          </form>

          <aside className="h-fit xl:sticky xl:top-6" aria-labelledby="preview-title">
            <div className="mb-3 flex items-center justify-between"><div><p className="eyebrow">Preview</p><h2 id="preview-title" className="mt-1 text-2xl font-bold text-primary">Article preview</h2></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">{displayLabel(post.status)}</span></div>
            <BlogPreview post={post} />
            <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-muted-foreground"><p className="font-bold text-primary">Local workflow</p><p className="mt-2">Saved posts are JSON records. Public blog routes and sitemap integration are added in a later phase.</p></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
