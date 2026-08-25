import { PRERENDER_PATHS } from './src/seo/seoRoutes.js';

/** @type {import('@react-router/dev/config').Config} */
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: PRERENDER_PATHS,
};
