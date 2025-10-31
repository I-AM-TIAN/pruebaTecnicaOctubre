import { Controller, Get, Post, Body, Param, Query, Logger, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Role, PrescriptionStatus } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('prescriptions')
export class PrescriptionsController {
  private readonly logger = new Logger(PrescriptionsController.name);

  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  /**
   * POST /prescriptions
   * Crear una nueva prescripción (solo Doctor)
   */
  @Post()
  @Auth(Role.doctor)
  async createPrescription(
    @GetUser('id') userId: string,
    @Body() createDto: CreatePrescriptionDto,
  ) {
    this.logger.log(`POST /prescriptions - Doctor: ${userId}`);
    return this.prescriptionsService.createPrescription(userId, createDto);
  }

  /**
   * GET /prescriptions?mine=true&status=pending&from=&to=&page=1&limit=10&order=desc
   * Obtener prescripciones con filtros (solo Doctor)
   */
  @Get()
  @Auth(Role.doctor)
  async getPrescriptions(
    @GetUser('id') userId: string,
    @Query('mine') mine?: string,
    @Query('status') status?: PrescriptionStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    const isMine = mine === 'true';
    this.logger.log(`GET /prescriptions - Doctor: ${userId}, mine: ${isMine}`);
    return this.prescriptionsService.getPrescriptions(userId, isMine, status, from, to, page, limit, order);
  }

  /**
   * GET /prescriptions/:id
   * Obtener una prescripción por ID (solo Doctor)
   */
  @Get(':id')
  @Auth(Role.doctor)
  async getPrescriptionById(
    @GetUser('id') userId: string,
    @Param('id') prescriptionId: string,
  ) {
    this.logger.log(`GET /prescriptions/${prescriptionId} - Doctor: ${userId}`);
    return this.prescriptionsService.getPrescriptionById(userId, prescriptionId);
  }
}
