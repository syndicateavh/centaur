import React from 'react';

/**
 * Render an image with optional AVIF/WebP sources while preserving a stable
 * intrinsic size. The component intentionally keeps the native img element in
 * the markup so images remain discoverable and accessible without JavaScript.
 */
export function ResponsiveImage({
  alt = '',
  className,
  decoding = 'async',
  fetchPriority,
  height,
  loading = 'lazy',
  priority = false,
  sizes = '100vw',
  sources = [],
  src,
  srcSet,
  width,
  ...rest
}) {
  const { onError, ...restImageProps } = rest;
  const handleImageError = (event) => {
    const image = event.currentTarget;
    const hasFallback = image.dataset.fallbackAttempted === 'true';

    // If a host serves an optional source with the wrong MIME type, remove the
    // picture sources and retry the stable fallback instead of leaving a blank
    // media area. The original handler still receives a genuine fallback error.
    if (src && !hasFallback && image.currentSrc !== src) {
      image.dataset.fallbackAttempted = 'true';
      image.parentElement?.querySelectorAll('source').forEach((source) => source.remove());
      image.removeAttribute('srcSet');
      image.removeAttribute('sizes');
      image.src = src;
      return;
    }

    onError?.(event);
  };

  const imageProps = {
    ...restImageProps,
    alt,
    className,
    decoding,
    fetchpriority: priority ? 'high' : fetchPriority,
    height,
    loading: priority ? 'eager' : loading,
    sizes,
    src,
    srcSet,
    onError: handleImageError,
    width,
  };

  const definedImageProps = Object.fromEntries(
    Object.entries(imageProps).filter(([, value]) => value !== undefined),
  );

  const definedSources = sources.filter((source) => source?.srcSet);
  if (definedSources.length === 0) return <img {...definedImageProps} />;

  return (
    <picture>
      {definedSources.map(({ media, sizes: sourceSizes, srcSet: sourceSet, type }, index) => (
        <source
          key={`${type || 'source'}-${index}`}
          media={media}
          sizes={sourceSizes || sizes}
          srcSet={sourceSet}
          type={type}
        />
      ))}
      <img {...definedImageProps} />
    </picture>
  );
}
