# Blog image handling

Phase 7 provides an in-house raster-image workflow for the file-based blog. Existing website language and meaning remain unchanged.

## Storage and accepted files

- Blog images are first-party files under `public/images/blog/` and are published at `/images/blog/<safe-name>.<extension>`.
- Supported formats are AVIF, GIF, JPEG/JPG, PNG, and WebP. SVG and remote image URLs are not accepted for published records.
- Each upload is limited to 10 MB and 8,000 pixels on either side.
- The local API validates the binary signature, extension, MIME type mapping, byte size, and actual width and height before writing a file.
- A different image uploaded with an existing name receives a deterministic SHA-256 suffix instead of overwriting the existing asset. Identical uploads reuse the existing file.

## Editorial and rendering behavior

- The local portal rejects unsupported files in the browser, sends the file MIME type, and fills the returned source, width, and height automatically.
- Alt text remains an editorial field and is required by the blog schema.
- Published cover and body images must use local `/images/blog/` paths, exist on disk, and contain dimensions matching the stored binary.
- Public output includes explicit image dimensions, alt text, asynchronous decoding, lazy loading for body/list images, and eager loading for the article cover image.
- Blog social metadata and BlogPosting JSON-LD use the validated cover image URL, dimensions, MIME type, and alt text.

## Verification

```text
npm run test:blog:image-parser
npm run test:blog:images
npm run seo:check
npm run seo:gate
```

The image verifier fails the build for corrupt, unsupported, oversized, dimension-mismatched, missing, or externally referenced blog images. Unused local images are reported as warnings so they can be reviewed without deleting recoverable files.
