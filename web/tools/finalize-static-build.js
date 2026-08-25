#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const spaFallback = path.resolve('build/client/__spa-fallback.html');

if (fs.existsSync(spaFallback)) {
  fs.unlinkSync(spaFallback);
  console.log('Removed the unused SPA fallback from the static deployment output.');
}
