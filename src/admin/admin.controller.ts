import { Controller, Get, Query, Logger, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /users?role=doctor|patient&page=1&limit=10
   * Solo accesible por Admin
   */
  @Get('users')
  @Auth(Role.admin)
  async getUsers(
    @Query('role') role?: Role,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`GET /users - role: ${role}, page: ${page}, limit: ${limit}`);
    return this.adminService.getUsers(role, page, limit);
  }

  /**
   * GET /admin/metrics?from=2025-01-01&to=2025-01-31
   * Obtiene métricas del sistema (totales, estados, tendencias, top doctores)
   * Solo accesible por Admin
   */
  @Get('admin/metrics')
  @Auth(Role.admin)
  async getMetrics(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    this.logger.log(`GET /admin/metrics - from: ${from}, to: ${to}`);
    return this.adminService.getMetrics(from, to);
  }
}
