import { Controller, Get, Query, Logger, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Doctors')
@ApiBearerAuth('access-token')
@Controller('doctors')
export class DoctorsController {
  private readonly logger = new Logger(DoctorsController.name);

  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @Auth(Role.admin)
  @ApiOperation({ summary: 'Listar doctores', description: 'Obtener lista de doctores con filtros (solo Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Elementos por página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre o email' })
  @ApiQuery({ name: 'specialty', required: false, type: String, description: 'Filtrar por especialidad' })
  @ApiResponse({ status: 200, description: 'Lista de doctores obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol admin)' })
  async getDoctors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
    @Query('specialty') specialty?: string,
  ) {
    this.logger.log(`GET /doctors - page: ${page}, limit: ${limit}, search: ${search}, specialty: ${specialty}`);
    return this.doctorsService.getDoctors(page, limit, search, specialty);
  }
}
