// src/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller() // sin path: responde en "/"
export class HealthController {
  @Get('/')
  root() {
    return { ok: true };
  }

  @Get('/healthz')
  healthz() {
    return { status: 'ok' };
  }
}
