import { Injectable, Logger, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionStatus } from '@prisma/client';
import { nanoid } from 'nanoid';

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva prescripción (solo Doctor)
   */
  async createPrescription(userId: string, createDto: CreatePrescriptionDto) {
    try {
      this.logger.log(`Doctor ${userId} creando prescripción para paciente ${createDto.patientId}`);

      // Obtener el doctor ID del userId
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId },
      });

      if (!doctor) {
        throw new ForbiddenException('Solo los doctores pueden crear prescripciones');
      }

      // Verificar que el paciente existe
      const patient = await this.prisma.patient.findUnique({
        where: { id: createDto.patientId },
      });

      if (!patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Generar código único para la prescripción
      const code = `RX-${nanoid(10).toUpperCase()}`;

      // Crear prescripción con items
      const prescription = await this.prisma.prescription.create({
        data: {
          code,
          notes: createDto.notes,
          authorId: doctor.id,
          patientId: createDto.patientId,
          items: {
            create: createDto.items,
          },
        },
        include: {
          items: true,
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              specialty: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Prescripción ${code} creada exitosamente`);

      return prescription;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error al crear prescripción: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al crear prescripción');
    }
  }

  /**
   * Obtener prescripciones con filtros (solo Doctor)
   */
  async getPrescriptions(
    userId: string,
    mine: boolean = false,
    status?: PrescriptionStatus,
    from?: string,
    to?: string,
    page: number = 1,
    limit: number = 10,
    order: 'asc' | 'desc' = 'desc',
  ) {
    try {
      this.logger.log(`Doctor ${userId} obteniendo prescripciones - mine: ${mine}, status: ${status}`);

      // Obtener el doctor ID
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId },
      });

      if (!doctor) {
        throw new ForbiddenException('Solo los doctores pueden ver prescripciones');
      }

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};

      // Si mine=true, solo sus prescripciones
      if (mine) {
        where.authorId = doctor.id;
      }

      // Filtro por status
      if (status) {
        where.status = status;
      }

      // Filtro por rango de fechas
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      const [prescriptions, total] = await Promise.all([
        this.prisma.prescription.findMany({
          where,
          skip,
          take: limit,
          include: {
            items: true,
            patient: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            author: {
              select: {
                id: true,
                specialty: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: order,
          },
        }),
        this.prisma.prescription.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: prescriptions,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Error al obtener prescripciones: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener prescripciones');
    }
  }

  /**
   * Obtener una prescripción por ID (solo Doctor)
   */
  async getPrescriptionById(userId: string, prescriptionId: string) {
    try {
      this.logger.log(`Doctor ${userId} obteniendo prescripción ${prescriptionId}`);

      // Obtener el doctor ID
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId },
      });

      if (!doctor) {
        throw new ForbiddenException('Solo los doctores pueden ver prescripciones');
      }

      const prescription = await this.prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: {
          items: true,
          patient: {
            select: {
              id: true,
              birthDate: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              specialty: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!prescription) {
        throw new NotFoundException('Prescripción no encontrada');
      }

      return prescription;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error al obtener prescripción: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener prescripción');
    }
  }
}
