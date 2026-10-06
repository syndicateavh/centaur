# Media storage and worker setup

Phase 6 uses a private Cloudflare R2 bucket through its S3-compatible API. Create the bucket without public access, then create an R2 API token limited to that bucket with object read/write permissions. Set the token's access key and secret in the API and worker environments; do not put them in frontend variables or commit them.

Configure these values in `certification/.env` (and the matching production secret store):

```dotenv
API_PUBLIC_URL=https://api.example.com
WEB_ORIGIN=https://learn.example.com
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_BUCKET=centaur-learning-media
R2_ACCESS_KEY_ID=<bucket-scoped access key>
R2_SECRET_ACCESS_KEY=<bucket-scoped secret key>
MEDIA_MAX_UPLOAD_BYTES=5368709120
MEDIA_UPLOAD_PART_BYTES=16777216
MEDIA_SIGNED_URL_TTL_SECONDS=600
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
```

`API_PUBLIC_URL` is the public API origin without a path. `WEB_ORIGIN` must match the browser app origin exactly. Install FFmpeg and FFprobe on every worker host and make them available on `PATH`, or set their executable paths. The worker needs enough temporary disk space for one source video plus HLS renditions. Uploads older than 24 hours are aborted; the R2 lifecycle policy may also abort incomplete multipart uploads after one day.

## R2 CORS policy

The browser sends multipart parts and requests signed HLS segments directly to the R2 S3 endpoint. Configure this CORS policy on the private bucket, replacing the origin with the exact learner app origin:

```json
[
  {
    "AllowedOrigins": ["https://learn.example.com"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["Content-Type", "Range"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Range", "Accept-Ranges"],
    "MaxAgeSeconds": 3600
  }
]
```

For local development, add `http://localhost:5173` as an additional allowed origin. Keep the bucket private: signed links are short-lived bearer links, and the learner API checks both enrollment and published-course status before it issues them. R2 requires browser CORS to be configured separately from the signature on a presigned URL, and presigned URL access uses the R2 S3 API endpoint.

## Upload and playback behavior

- Admins upload 16 MiB parts directly to R2. The API creates an upload key scoped to one draft-course lesson and user, signs each part, verifies the server-side part list and total byte count, checks file signatures, then finalizes once and enqueues a job.
- Repeated completion requests are safe. BullMQ uses a stable job ID, retries processing with exponential backoff, and the worker reconciles stale `processing` records if enqueueing was interrupted.
- PDFs are signature-checked and made available through a short-lived signed read URL. Videos are probed, receive a poster, and are encoded as one or more HLS resolutions supported by the source dimensions. The worker retries at lower bitrates and rejects output if the rendition set is larger than the source.
- HLS playlists are served only after enrollment authorization. Playlist URLs are rewritten so playlists are rechecked by the API while video segments use short-lived signed R2 URLs. The R2 CORS policy above is required for browser playback.
- Admin upload status and processing metadata are visible in the course builder. Reprocessing can be retried from the lesson editor.
