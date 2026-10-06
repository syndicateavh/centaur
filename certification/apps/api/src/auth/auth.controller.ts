import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { SessionService, sessionTokenFrom } from './session.service.js';
import { loginSchema, registerSchema, type LoginBody, type RegisterBody } from './auth.schemas.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(SessionService) private readonly sessions: SessionService,
  ) {}

  @Get('csrf')
  getCsrfToken(@Res({ passthrough: true }) response: Response) {
    return { csrfToken: this.sessions.issueCsrfToken(response) };
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) input: RegisterBody,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.auth.register(input, request.ip ?? 'unknown', sessionTokenFrom(request), response);
    return { user };
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) input: LoginBody,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.auth.login(input, request.ip ?? 'unknown', sessionTokenFrom(request), response);
    return { user };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.sessions.revokeRequestSession(request, response);
    return { ok: true };
  }

}
