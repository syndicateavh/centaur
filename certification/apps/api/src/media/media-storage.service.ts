import { Injectable, OnApplicationShutdown, ServiceUnavailableException } from '@nestjs/common';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListPartsCommand,
  S3Client,
  UploadPartCommand,
  type ListPartsCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { parseApiEnv } from '@centaur/lms-config';

@Injectable()
export class MediaStorageService implements OnApplicationShutdown {
  private readonly environment = parseApiEnv(process.env);
  private client?: S3Client;

  onApplicationShutdown() {
    this.client?.destroy();
  }

  get bucket() {
    return this.configuration().bucket;
  }

  createMultipart(key: string, contentType: string, metadata: Record<string, string>) {
    const { client, bucket } = this.configuration();
    return client.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType, Metadata: metadata }));
  }

  async signUploadPart(key: string, uploadId: string, partNumber: number) {
    const { client, bucket } = this.configuration();
    return getSignedUrl(client, new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber }), { expiresIn: 900 });
  }

  async listParts(key: string, uploadId: string) {
    const { client, bucket } = this.configuration();
    const parts: NonNullable<ListPartsCommandOutput['Parts']> = [];
    let partNumberMarker: string | undefined;
    let truncated = false;
    do {
      const page = await client.send(new ListPartsCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumberMarker: partNumberMarker }));
      parts.push(...(page.Parts ?? []));
      partNumberMarker = page.NextPartNumberMarker;
      truncated = page.IsTruncated ?? false;
      if (truncated && !partNumberMarker) throw new Error('Object storage returned an incomplete multipart page.');
    } while (truncated);
    return { Parts: parts };
  }

  completeMultipart(key: string, uploadId: string, parts: Array<{ PartNumber: number; ETag: string }>) {
    const { client, bucket } = this.configuration();
    return client.send(new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId, MultipartUpload: { Parts: parts } }));
  }

  abortMultipart(key: string, uploadId: string) {
    const { client, bucket } = this.configuration();
    return client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
  }

  head(key: string) {
    const { client, bucket } = this.configuration();
    return client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  }

  async signDownload(key: string, contentType?: string, expiresInSeconds = this.environment.MEDIA_SIGNED_URL_TTL_SECONDS) {
    const { client, bucket } = this.configuration();
    return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key, ...(contentType ? { ResponseContentType: contentType } : {}) }), { expiresIn: expiresInSeconds });
  }

  async readText(key: string) {
    const { client, bucket } = this.configuration();
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return response.Body?.transformToString('utf-8') ?? '';
  }

  async readBytes(key: string, range: string) {
    const { client, bucket } = this.configuration();
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: range }));
    return response.Body?.transformToByteArray() ?? new Uint8Array();
  }

  delete(key: string) {
    const { client, bucket } = this.configuration();
    return client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  private configuration() {
    const { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = this.environment;
    if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      throw new ServiceUnavailableException({ code: 'MEDIA_STORAGE_NOT_CONFIGURED', message: 'Media storage is not configured.' });
    }
    this.client ??= new S3Client({
      endpoint: R2_ENDPOINT,
      region: 'auto',
      forcePathStyle: true,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });
    return { client: this.client, bucket: R2_BUCKET };
  }
}
