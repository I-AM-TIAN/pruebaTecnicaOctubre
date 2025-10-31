import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtener usuarios con filtros opcionales
   */
  async getUsers(role?: Role, page: number = 1, limit: number = 10) {
    try {
      this.logger.log(`Obteniendo usuarios - role: ${role}, page: ${page}, limit: ${limit}`);

      const skip = (page - 1) * limit;

      const where = role ? { role } : {};

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            doctor: {
              select: {
                id: true,
                specialty: true,
              },
            },
            patient: {
              select: {
                id: true,
                birthDate: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(`Error al obtener usuarios: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener usuarios');
    }
  }

  /**
   * Obtener métricas del sistema (Admin)
   */
  async getMetrics(from?: string, to?: string) {
    try {
      this.logger.log(`Obteniendo métricas del sistema - from: ${from}, to: ${to}`);

      // Filtro de fechas si se proporciona
      const dateFilter = (from || to) ? {
        createdAt: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      } : {};

      // === TOTALES GENERALES ===
      const [totalDoctors, totalPatients, totalPrescriptions] = await Promise.all([
        this.prisma.doctor.count(),
        this.prisma.patient.count(),
        this.prisma.prescription.count(
          from || to ? { where: dateFilter } : undefined
        ),
      ]);

      // === PRESCRIPCIONES POR ESTADO ===
      const prescriptionsByStatus = await this.prisma.prescription.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
        ...(dateFilter && { where: dateFilter }),
      });

      const byStatus = {
        pending: prescriptionsByStatus.find(p => p.status === 'pending')?._count.status || 0,
        consumed: prescriptionsByStatus.find(p => p.status === 'consumed')?._count.status || 0,
      };

      // === PRESCRIPCIONES POR DÍA (últimos días según el rango) ===
      const prescriptionsByDay = await this.prisma.prescription.groupBy({
        by: ['createdAt'],
        _count: {
          createdAt: true,
        },
        ...(dateFilter && { where: dateFilter }),
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Agrupar por día (sin hora)
      const byDay = prescriptionsByDay.reduce((acc, item) => {
        const date = new Date(item.createdAt).toISOString().split('T')[0];
        const existing = acc.find(d => d.date === date);
        if (existing) {
          existing.count += item._count.createdAt;
        } else {
          acc.push({ date, count: item._count.createdAt });
        }
        return acc;
      }, [] as Array<{ date: string; count: number }>);

      // === TOP DOCTORES (más prescripciones) ===
      const topDoctors = await this.prisma.prescription.groupBy({
        by: ['authorId'],
        _count: {
          authorId: true,
        },
        ...(dateFilter && { where: dateFilter }),
        orderBy: {
          _count: {
            authorId: 'desc',
          },
        },
        take: 10,
      });

      // Obtener información de los doctores
      const topDoctorsWithInfo = await Promise.all(
        topDoctors.map(async (item) => {
          const doctor = await this.prisma.doctor.findUnique({
            where: { id: item.authorId },
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
          });

          return {
            doctorId: item.authorId,
            doctorName: doctor?.user.name || 'Desconocido',
            specialty: doctor?.specialty || 'No especificada',
            count: item._count.authorId,
          };
        })
      );

      return {
        totals: {
          doctors: totalDoctors,
          patients: totalPatients,
          prescriptions: totalPrescriptions,
        },
        byStatus,
        byDay,
        topDoctors: topDoctorsWithInfo,
      };
    } catch (error) {
      this.logger.error(`Error al obtener métricas: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener métricas');
    }
  }
}
