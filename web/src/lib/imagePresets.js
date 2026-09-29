export const RESPONSIVE_IMAGE_WIDTHS = Object.freeze([
  320,
  480,
  640,
  768,
  1024,
  1280,
  1600,
]);

export const RESPONSIVE_IMAGE_FORMATS = Object.freeze(['avif', 'webp']);

export const BRAND_LOGO_SOURCES = Object.freeze(createImageSources({
  basePath: '/images/brand/centaur-careers-logo',
  widths: [48, 96, 144],
}));

/**
 * Build a width descriptor list for the image naming convention:
 * /images/<area>/<name>-<width>.<format>
 */
export function createImageSrcSet(
  basePath,
  format = 'webp',
  widths = RESPONSIVE_IMAGE_WIDTHS,
) {
  return widths
    .map((width) => `${basePath}-${width}.${format} ${width}w`)
    .join(', ');
}

/**
 * Build picture sources in priority order. The browser selects the first
 * supported format and falls back to the regular img src supplied to
 * ResponsiveImage.
 */
export function createImageSources({
  basePath,
  formats = RESPONSIVE_IMAGE_FORMATS,
  sizes,
  widths = RESPONSIVE_IMAGE_WIDTHS,
}) {
  return formats.map((format) => ({
    sizes,
    srcSet: createImageSrcSet(basePath, format, widths),
    type: `image/${format}`,
  }));
}

