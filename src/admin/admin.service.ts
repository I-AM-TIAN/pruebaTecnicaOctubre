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
}
