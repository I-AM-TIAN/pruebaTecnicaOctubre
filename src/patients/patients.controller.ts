import { Controller, Get, Query, Logger, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Patients')
@ApiBearerAuth('access-token')
@Controller('patients')
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name);

  constructor(private readonly patientsService: PatientsService) {}

  /**
   * GET /patients?page=1&limit=10&search=maria
   * Accesible por Admin y Doctor
   */
  @Get()
  @Auth(Role.admin, Role.doctor)
  @ApiOperation({ summary: 'Listar pacientes', description: 'Obtener lista de pacientes con filtros (Admin y Doctor)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Elementos por página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre o email' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol admin o doctor)' })
  async getPatients(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
  ) {
    this.logger.log(`GET /patients - page: ${page}, limit: ${limit}, search: ${search}`);
    return this.patientsService.getPatients(page, limit, search);
  }
}
