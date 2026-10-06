import { Catch, HttpException, HttpStatus, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionBody = exception instanceof HttpException ? exception.getResponse() : null;
    const details = typeof exceptionBody === 'object' && exceptionBody !== null
      ? exceptionBody as { code?: unknown; message?: unknown }
      : null;
    const code = typeof details?.code === 'string' ? details.code : this.defaultCode(status);
    const message = status >= 500
      ? 'Internal server error.'
      : typeof details?.message === 'string'
        ? details.message
        : typeof exceptionBody === 'string'
          ? exceptionBody
          : 'Request could not be completed.';

    response.status(status).json({
      error: {
        code,
        message,
        requestId: String(request.id ?? 'unavailable'),
      },
    });
  }

  private defaultCode(status: number) {
    if (status === HttpStatus.BAD_REQUEST) return 'BAD_REQUEST';
    if (status === HttpStatus.UNAUTHORIZED) return 'UNAUTHENTICATED';
    if (status === HttpStatus.FORBIDDEN) return 'FORBIDDEN';
    if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
    if (status === HttpStatus.TOO_MANY_REQUESTS) return 'RATE_LIMITED';
    return status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED';
  }
}
