import { Controller, Get, HttpException, HttpStatus, Inject, Req } from '@nestjs/common';
import type { Request } from 'express';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(@Inject(HealthService) private readonly health: HealthService) {}

  @Get()
  async getHealth(@Req() request: Request) {
    const status = await this.health.check(String(request.id ?? 'unavailable'));
    if (status.status !== 'ok') {
      throw new HttpException(status, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return status;
  }
}
