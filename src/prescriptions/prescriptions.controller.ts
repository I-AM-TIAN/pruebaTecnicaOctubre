import { Controller, Get, Post, Put, Body, Param, Query, Logger, ParseIntPipe, DefaultValuePipe, Res } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Role, PrescriptionStatus } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { Response } from 'express';

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

  // ==================== ENDPOINTS PARA ADMIN ====================

  /**
   * GET /admin/prescriptions?status=&doctorId=&patientId=&from=&to=&page=1&limit=10
   * Obtener todas las prescripciones con filtros (solo Admin)
   */
  @Get('admin/prescriptions')
  @Auth(Role.admin)
  async getAllPrescriptionsAdmin(
    @Query('status') status?: PrescriptionStatus,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`GET /admin/prescriptions - Admin - status: ${status}`);
    return this.prescriptionsService.getAllPrescriptions(status, doctorId, patientId, from, to, page, limit);
  }

  // ==================== ENDPOINTS PARA PACIENTES ====================

  /**
   * GET /me/prescriptions?status=pending&page=1&limit=10
   * Obtener mis prescripciones (solo Patient)
   */
  @Get('me/prescriptions')
  @Auth(Role.patient)
  async getMyPrescriptions(
    @GetUser('id') userId: string,
    @Query('status') status?: PrescriptionStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`GET /me/prescriptions - Patient: ${userId}`);
    return this.prescriptionsService.getMyPrescriptions(userId, status, page, limit);
  }

  /**
   * PUT /prescriptions/:id/consume
   * Marcar prescripción como consumida (solo Patient y si es suya)
   */
  @Put(':id/consume')
  @Auth(Role.patient)
  async consumePrescription(
    @GetUser('id') userId: string,
    @Param('id') prescriptionId: string,
  ) {
    this.logger.log(`PUT /prescriptions/${prescriptionId}/consume - Patient: ${userId}`);
    return this.prescriptionsService.consumePrescription(userId, prescriptionId);
  }

  /**
   * GET /prescriptions/:id/pdf
   * Descargar prescripción en PDF (solo Patient y si es suya)
   */
  @Get(':id/pdf')
  @Auth(Role.patient)
  async getPrescriptionPdf(
    @GetUser('id') userId: string,
    @Param('id') prescriptionId: string,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /prescriptions/${prescriptionId}/pdf - Patient: ${userId}`);
    return this.prescriptionsService.generatePrescriptionPdf(userId, prescriptionId, res);
  }
}
