import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Intento de login para: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetUser('id') userId: string,
    @GetUser('email') email: string,
  ) {
    this.logger.log(`Renovando tokens para usuario: ${email}`);
    return this.authService.refreshToken(userId, email);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@GetUser() user: any) {
    this.logger.log(`Obteniendo perfil para usuario: ${user.email}`);
    return {
      message: 'Perfil del usuario autenticado',
      user,
    };
  }

  @Get('validate')
  @UseGuards(AuthGuard('jwt'))
  async validateToken(@GetUser() user: any) {
    this.logger.log(`Validando token para usuario: ${user.email}`);
    return {
      valid: true,
      user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @GetUser('id') userId: string,
    @GetUser('email') email: string,
  ) {
    this.logger.log(`Cerrando sesión para usuario: ${email}`);
    return this.authService.logout(userId, email);
  }
}
