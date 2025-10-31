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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetUser } from './decorators/get-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Autenticar usuario y obtener tokens JWT' })
  @ApiResponse({ status: 200, description: 'Login exitoso. Retorna access y refresh tokens.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Intento de login para: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Refrescar token', description: 'Obtener un nuevo access token usando el refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refrescados exitosamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  @ApiBody({ type: RefreshTokenDto })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener perfil', description: 'Obtener información del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario retornado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getProfile(@GetUser() user: any) {
    this.logger.log(`Obteniendo perfil para usuario: ${user.email}`);
    return {
      message: 'Perfil del usuario autenticado',
      user,
    };
  }

  @Get('validate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Validar token', description: 'Verificar si el token JWT es válido' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cerrar sesión', description: 'Invalidar el token actual y cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async logout(
    @GetUser('id') userId: string,
    @GetUser('email') email: string,
  ) {
    this.logger.log(`Cerrando sesión para usuario: ${email}`);
    return this.authService.logout(userId, email);
  }
}
