import { Controller, Get, Post, Put, Body, Param, Query, Logger, ParseIntPipe, DefaultValuePipe, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Role, PrescriptionStatus } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { Response } from 'express';

@ApiTags('Prescriptions')
@ApiBearerAuth('access-token')
@Controller('prescriptions')
export class PrescriptionsController {
  private readonly logger = new Logger(PrescriptionsController.name);

  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Auth(Role.doctor)
  @ApiOperation({ summary: 'Crear prescripción', description: 'Crear una nueva prescripción médica (solo Doctor)' })
  @ApiBody({ type: CreatePrescriptionDto })
  @ApiResponse({ status: 201, description: 'Prescripción creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol doctor)' })
  async createPrescription(
    @GetUser('id') userId: string,
    @Body() createDto: CreatePrescriptionDto,
  ) {
    this.logger.log(`POST /prescriptions - Doctor: ${userId}`);
    return this.prescriptionsService.createPrescription(userId, createDto);
  }

  @Get('admin/prescriptions')
  @Auth(Role.admin)
  @ApiOperation({ summary: 'Todas las prescripciones (Admin)', description: 'Ver todas las prescripciones del sistema con filtros (solo Admin)' })
  @ApiQuery({ name: 'status', required: false, enum: PrescriptionStatus })
  @ApiQuery({ name: 'doctorId', required: false, type: String })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String, example: '2025-10-01' })
  @ApiQuery({ name: 'to', required: false, type: String, example: '2025-10-31' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de prescripciones' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol admin)' })
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

  @Get('me/prescriptions')
  @Auth(Role.patient)
  @ApiOperation({ summary: 'Mis prescripciones', description: 'Ver mis prescripciones como paciente (solo Patient)' })
  @ApiQuery({ name: 'status', required: false, enum: PrescriptionStatus })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de mis prescripciones' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol patient)' })
  async getMyPrescriptions(
    @GetUser('id') userId: string,
    @Query('status') status?: PrescriptionStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`GET /me/prescriptions - Patient: ${userId}`);
    return this.prescriptionsService.getMyPrescriptions(userId, status, page, limit);
  }

  @Put(':id/consume')
  @Auth(Role.patient)
  @ApiOperation({ summary: 'Consumir prescripción', description: 'Marcar una prescripción como consumida (solo Patient)' })
  @ApiParam({ name: 'id', description: 'ID de la prescripción' })
  @ApiResponse({ status: 200, description: 'Prescripción marcada como consumida' })
  @ApiResponse({ status: 400, description: 'Prescripción ya consumida' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos o no es tu prescripción' })
  @ApiResponse({ status: 404, description: 'Prescripción no encontrada' })
  async consumePrescription(
    @GetUser('id') userId: string,
    @Param('id') prescriptionId: string,
  ) {
    this.logger.log(`PUT /prescriptions/${prescriptionId}/consume - Patient: ${userId}`);
    return this.prescriptionsService.consumePrescription(userId, prescriptionId);
  }

  @Get(':id/pdf')
  @Auth(Role.patient, Role.admin)
  @ApiOperation({ summary: 'Descargar PDF', description: 'Descargar prescripción en formato PDF (solo Patient)' })
  @ApiParam({ name: 'id', description: 'ID de la prescripción' })
  @ApiResponse({ status: 200, description: 'PDF generado', content: { 'application/pdf': {} } })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos o no es tu prescripción' })
  @ApiResponse({ status: 404, description: 'Prescripción no encontrada' })
  async getPrescriptionPdf(
    @GetUser('id') userId: string,
    @Param('id') prescriptionId: string,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /prescriptions/${prescriptionId}/pdf - Patient: ${userId}`);
    return this.prescriptionsService.generatePrescriptionPdf(userId, prescriptionId, res);
  }

  @Get()
  @Auth(Role.doctor)
  @ApiOperation({ summary: 'Mis prescripciones como doctor', description: 'Obtener solo las prescripciones creadas por el doctor autenticado' })
  @ApiQuery({ name: 'status', required: false, enum: PrescriptionStatus, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'from', required: false, type: String, example: '2025-10-01', description: 'Fecha inicial (ISO)' })
  @ApiQuery({ name: 'to', required: false, type: String, example: '2025-10-31', description: 'Fecha final (ISO)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiResponse({ status: 200, description: 'Lista de prescripciones del doctor' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos (requiere rol doctor)' })
  async getPrescriptions(
    @GetUser('id') userId: string,
    @Query('status') status?: PrescriptionStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    this.logger.log(`GET /prescriptions - Doctor: ${userId}`);
    return this.prescriptionsService.getPrescriptions(userId, true, status, from, to, page, limit, order);
  }

  @Get(':id')
  @Auth(Role.patient, Role.doctor, Role.admin)
  @ApiOperation({ summary: 'Ver prescripción por ID', description: 'Obtener detalle de una prescripción (Doctor o Patient)' })
  @ApiParam({ name: 'id', description: 'ID de la prescripción' })
  @ApiResponse({ status: 200, description: 'Prescripción encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiResponse({ status: 404, description: 'Prescripción no encontrada' })
  async getPrescriptionById(
    @GetUser('id') userId: string,
    @Param('id') prescriptionId: string,
  ) {
    this.logger.log(`GET /prescriptions/${prescriptionId} - User: ${userId}`);
    return this.prescriptionsService.getPrescriptionById(userId, prescriptionId);
  }
}
