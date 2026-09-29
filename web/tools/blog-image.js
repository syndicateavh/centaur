#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  BLOG_IMAGE_MAX_BYTES,
  BLOG_IMAGE_MAX_DIMENSION,
  BLOG_IMAGE_NAME_PATTERN,
  BLOG_IMAGE_MIME_TYPES,
  getBlogImageExtension,
  blogImagePublicPath,
  normalizeBlogImageName,
} from '../src/content/blog/imageConfig.js';
import { BLOG_IMAGES_DIRECTORY } from '../src/content/blog/storageConfig.js';

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolDirectory, '..');
export const BLOG_IMAGES_ROOT = path.resolve(projectRoot, BLOG_IMAGES_DIRECTORY);

function hasBytes(buffer, offset, bytes) {
  return offset >= 0 && offset + bytes <= buffer.length;
}

function readPngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG' || buffer[0] !== 0x89 || buffer.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), format: 'png' };
}

function readGifDimensions(buffer) {
  if (buffer.length < 10) return null;
  const signature = buffer.toString('ascii', 0, 6);
  if (signature !== 'GIF87a' && signature !== 'GIF89a') return null;
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8), format: 'gif' };
}

function readJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (!hasBytes(buffer, offset, 2)) break;
    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || !hasBytes(buffer, offset, segmentLength)) break;
    const isSizeMarker = (marker >= 0xc0 && marker <= 0xc3)
      || (marker >= 0xc5 && marker <= 0xc7)
      || (marker >= 0xc9 && marker <= 0xcb)
      || (marker >= 0xcd && marker <= 0xcf);
    if (isSizeMarker && segmentLength >= 7) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
        format: 'jpeg',
      };
    }
    offset += segmentLength;
  }
  return null;
}

function readWebpDimensions(buffer) {
  if (buffer.length < 16 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (!hasBytes(buffer, data, chunkSize)) break;
    if (chunkType === 'VP8X' && chunkSize >= 10) {
      return {
        width: 1 + buffer.readUIntLE(data + 4, 3),
        height: 1 + buffer.readUIntLE(data + 7, 3),
        format: 'webp',
      };
    }
    if (chunkType === 'VP8 ' && chunkSize >= 10 && buffer[data + 3] === 0x9d && buffer[data + 4] === 0x01 && buffer[data + 5] === 0x2a) {
      return { width: buffer.readUInt16LE(data + 6) & 0x3fff, height: buffer.readUInt16LE(data + 8) & 0x3fff, format: 'webp' };
    }
    if (chunkType === 'VP8L' && chunkSize >= 5 && buffer[data] === 0x2f) {
      return {
        width: 1 + ((buffer[data + 1] | (buffer[data + 2] << 8)) & 0x3fff),
        height: 1 + (((buffer[data + 2] >> 6) | (buffer[data + 3] << 2) | (buffer[data + 4] << 10)) & 0x3fff),
        format: 'webp',
      };
    }
    offset = data + chunkSize + (chunkSize % 2);
  }
  return null;
}

function readAvifDimensions(buffer) {
  if (buffer.length < 16 || buffer.toString('ascii', 4, 8) !== 'ftyp') return null;
  const brands = [];
  for (let offset = 8; offset + 4 <= Math.min(buffer.length, 128); offset += 4) brands.push(buffer.toString('ascii', offset, offset + 4));
  if (!brands.some((brand) => brand === 'avif' || brand === 'avis')) return null;
  const ispeOffset = buffer.indexOf('ispe', 0, 'ascii');
  if (ispeOffset < 0 || !hasBytes(buffer, ispeOffset + 4, 12)) return null;
  return {
    width: buffer.readUInt32BE(ispeOffset + 8),
    height: buffer.readUInt32BE(ispeOffset + 12),
    format: 'avif',
  };
}

function detectImage(buffer) {
  return readPngDimensions(buffer)
    || readJpegDimensions(buffer)
    || readGifDimensions(buffer)
    || readWebpDimensions(buffer)
    || readAvifDimensions(buffer);
}

export function inspectBlogImage(contents, fileName) {
  const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(contents);
  const name = normalizeBlogImageName(fileName);
  if (!BLOG_IMAGE_NAME_PATTERN.test(name)) throw new Error(`Unsupported blog image name: ${name}`);
  if (buffer.length === 0) throw new Error('The image file is empty');
  if (buffer.length > BLOG_IMAGE_MAX_BYTES) throw new Error(`Images must be ${Math.floor(BLOG_IMAGE_MAX_BYTES / (1024 * 1024))} MB or smaller`);

  const dimensions = detectImage(buffer);
  const extension = getBlogImageExtension(name);
  if (!dimensions || !extension || dimensions.format !== (extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : extension)) {
    throw new Error('The uploaded file is not a valid supported raster image or its extension does not match its contents');
  }
  if (!Number.isInteger(dimensions.width) || !Number.isInteger(dimensions.height) || dimensions.width <= 0 || dimensions.height <= 0) {
    throw new Error('The image dimensions could not be read');
  }
  if (dimensions.width > BLOG_IMAGE_MAX_DIMENSION || dimensions.height > BLOG_IMAGE_MAX_DIMENSION) {
    throw new Error(`Images must not exceed ${BLOG_IMAGE_MAX_DIMENSION} pixels on either side`);
  }

  return {
    name,
    src: blogImagePublicPath(name),
    extension,
    mimeType: BLOG_IMAGE_MIME_TYPES[extension],
    width: dimensions.width,
    height: dimensions.height,
    bytes: buffer.length,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
  };
}

export function readBlogImageFile(fileName) {
  const name = normalizeBlogImageName(fileName);
  const filePath = path.join(BLOG_IMAGES_ROOT, name);
  return inspectBlogImage(fs.readFileSync(filePath), name);
}
