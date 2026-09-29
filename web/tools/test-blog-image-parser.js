#!/usr/bin/env node

import assert from 'node:assert/strict';
import { inspectBlogImage } from './blog-image.js';

function png(width, height) {
  const buffer = Buffer.alloc(24);
  buffer.writeUInt32BE(0x89504e47, 0);
  buffer.writeUInt32BE(0x0d0a1a0a, 4);
  buffer.write('IHDR', 12, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

function gif(width, height) {
  const buffer = Buffer.alloc(10, 0);
  buffer.write('GIF89a', 0, 'ascii');
  buffer.writeUInt16LE(width, 6);
  buffer.writeUInt16LE(height, 8);
  return buffer;
}

function jpeg(width, height) {
  const buffer = Buffer.alloc(21, 0);
  buffer.writeUInt16BE(0xffd8, 0);
  buffer[2] = 0xff;
  buffer[3] = 0xc0;
  buffer.writeUInt16BE(17, 4);
  buffer[6] = 8;
  buffer.writeUInt16BE(height, 7);
  buffer.writeUInt16BE(width, 9);
  return buffer;
}

function webp(width, height) {
  const buffer = Buffer.alloc(30, 0);
  buffer.write('RIFF', 0, 'ascii');
  buffer.write('WEBP', 8, 'ascii');
  buffer.write('VP8X', 12, 'ascii');
  buffer.writeUInt32LE(10, 16);
  buffer.writeUIntLE(width - 1, 24, 3);
  buffer.writeUIntLE(height - 1, 27, 3);
  return buffer;
}

function avif(width, height) {
  const buffer = Buffer.alloc(32, 0);
  buffer.write('ftyp', 4, 'ascii');
  buffer.write('avif', 8, 'ascii');
  buffer.write('ispe', 16, 'ascii');
  buffer.writeUInt32BE(width, 24);
  buffer.writeUInt32BE(height, 28);
  return buffer;
}

const pngMetadata = inspectBlogImage(png(1200, 630), 'guide.png');
assert.equal(pngMetadata.name, 'guide.png');
assert.equal(pngMetadata.src, '/images/blog/guide.png');
assert.equal(pngMetadata.mimeType, 'image/png');
assert.equal(pngMetadata.width, 1200);
assert.equal(pngMetadata.height, 630);
assert.equal(pngMetadata.bytes, 24);
assert.equal(inspectBlogImage(gif(800, 600), 'guide.gif').width, 800);
assert.equal(inspectBlogImage(jpeg(1600, 900), 'guide.jpg').height, 900);
assert.equal(inspectBlogImage(webp(1280, 720), 'guide.webp').width, 1280);
assert.equal(inspectBlogImage(avif(1920, 1080), 'guide.avif').height, 1080);
assert.throws(() => inspectBlogImage(png(1200, 630), 'guide.jpg'), /extension does not match/);
assert.throws(() => inspectBlogImage(Buffer.from('not an image'), 'guide.webp'), /not a valid supported raster image/);
assert.throws(() => inspectBlogImage(png(8001, 630), 'too-wide.png'), /must not exceed/);

console.log('Blog image signature, format, dimension, and limit contracts verified.');
