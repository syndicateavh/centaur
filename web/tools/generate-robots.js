#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN } from '../src/seo/siteConfig.js';

const siteUrl = new URL(SITE_ORIGIN);

if (siteUrl.protocol !== 'https:' || siteUrl.hostname.startsWith('www.') || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
  throw new Error('SITE_ORIGIN must be a canonical HTTPS origin without www, path, query, or hash: ' + SITE_ORIGIN);
}

// Keep the crawler policy deliberately open. Named groups make the policy
// obvious to major search and answer engines; the wildcard covers every bot.
const robots = 'User-agent: Googlebot\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: Google-Extended\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: GoogleOther\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: Bingbot\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: OAI-SearchBot\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: ChatGPT-User\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: PerplexityBot\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: GPTBot\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: Claude-SearchBot\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: Claude-User\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: Applebot-Extended\n'
  + 'Allow: /\n'
  + '\n'
  + 'User-agent: *\n'
  + 'Allow: /\n'
  + '\n'
  + 'Sitemap: ' + siteUrl.origin + '/sitemap.xml\n';

const outputPath = path.resolve('public/robots.txt');
fs.writeFileSync(outputPath, robots, 'utf8');
console.log('Generated robots.txt for ' + siteUrl.origin + '.');
