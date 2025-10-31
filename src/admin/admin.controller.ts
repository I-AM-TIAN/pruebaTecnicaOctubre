import { Controller, Get, Query, Logger, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
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
  @ApiOperation({ summary: 'Listar usuarios', description: 'Obtener lista de usuarios con filtros y paginación (solo Admin)' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filtrar por rol' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Elementos por página' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol admin)' })
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
  @ApiOperation({ summary: 'Obtener métricas del sistema', description: 'Estadísticas generales del sistema (solo Admin)' })
  @ApiQuery({ name: 'from', required: false, type: String, example: '2025-10-01', description: 'Fecha inicial (ISO)' })
  @ApiQuery({ name: 'to', required: false, type: String, example: '2025-10-31', description: 'Fecha final (ISO)' })
  @ApiResponse({ status: 200, description: 'Métricas obtenidas exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol admin)' })
  async getMetrics(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    this.logger.log(`GET /admin/metrics - from: ${from}, to: ${to}`);
    return this.adminService.getMetrics(from, to);
  }
}
