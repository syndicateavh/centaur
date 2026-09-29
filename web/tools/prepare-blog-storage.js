#!/usr/bin/env node

import { BLOG_IMAGES_ROOT, BLOG_POSTS_ROOT, ensureBlogStorageDirectories } from './blog-storage.js';

ensureBlogStorageDirectories();
console.log(`Blog storage ready: ${BLOG_POSTS_ROOT} and ${BLOG_IMAGES_ROOT}`);
