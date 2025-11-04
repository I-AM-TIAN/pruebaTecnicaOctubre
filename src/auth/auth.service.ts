import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly tokenBlacklist = new Set<string>(); // Blacklist de tokens invalidados

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      if (!email || !password) {
        throw new BadRequestException('Email y contraseña son requeridos');
      }

      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          doctor: true,
          patient: true,
        },
      });

      if (!user) {
        this.logger.warn(`Intento de login fallido para email: ${email}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Contraseña incorrecta para usuario: ${email}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.removeFromBlacklist(user.id);

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      const { password: _, ...userWithoutPassword } = user;

      this.logger.log(`Usuario ${email} ha iniciado sesión exitosamente`);

      return {
        user: userWithoutPassword,
        ...tokens,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Error inesperado durante login: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Error al procesar la solicitud de inicio de sesión',
      );
    }
  }

  async refreshToken(userId: string, email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        this.logger.warn(`Intento de refresh token con usuario inexistente: ${userId}`);
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      this.logger.log(`Tokens renovados para usuario: ${email}`);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Error al renovar tokens: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Error al renovar el token de acceso',
      );
    }
  }

  async validateUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
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
      });

      if (!user) {
        this.logger.warn(`Validación fallida para usuario: ${userId}`);
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Error al validar usuario: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error al validar el usuario');
    }
  }

  async logout(userId: string, email: string) {
    try {
      this.tokenBlacklist.add(userId);

      this.logger.log(`Usuario ${email} (ID: ${userId}) ha cerrado sesión. Token invalidado.`);

      return {
        message: 'Sesión cerrada exitosamente',
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Error al cerrar sesión: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error al cerrar sesión');
    }
  }

  isTokenBlacklisted(userId: string): boolean {
    return this.tokenBlacklist.has(userId);
  }

  private removeFromBlacklist(userId: string): void {
    this.tokenBlacklist.delete(userId);
  }

  private async generateTokens(userId: string, email: string, role?: string) {
    try {
      const payload: any = { sub: userId, email, role };
      const refreshPayload: any = { sub: userId, email };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'fallback-secret',
        expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
      } as any);

      const refreshToken = await this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      } as any);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(
        `Error al generar tokens: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error al generar tokens de autenticación');
    }
  }
}
