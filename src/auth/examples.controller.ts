import { Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

/**
 * Este controlador de ejemplo muestra cómo usar el módulo de autenticación
 * con diferentes roles y protección de rutas
 */
@Controller('examples')
export class ExamplesController {
  /**
   * Ruta pública - No requiere autenticación
   */
  @Get('public')
  getPublicData() {
    return {
      message: 'Esta es una ruta pública, accesible sin autenticación',
    };
  }

  /**
   * Ruta protegida - Solo usuarios autenticados
   * Cualquier rol puede acceder (admin, doctor, patient)
   */
  @Get('protected')
  @Auth(Role.admin, Role.doctor, Role.patient)
  getProtectedData(@GetUser() user: any) {
    return {
      message: 'Ruta protegida - Usuario autenticado',
      user,
    };
  }

  /**
   * Ruta solo para Admin
   */
  @Get('admin-only')
  @Auth(Role.admin)
  getAdminData(@GetUser() user: any) {
    return {
      message: 'Esta ruta es solo para administradores',
      user,
    };
  }

  /**
   * Ruta solo para Doctors
   */
  @Get('doctor-only')
  @Auth(Role.doctor)
  getDoctorData(@GetUser() user: any) {
    return {
      message: 'Esta ruta es solo para doctores',
      user,
    };
  }

  /**
   * Ruta solo para Patients
   */
  @Get('patient-only')
  @Auth(Role.patient)
  getPatientData(@GetUser() user: any) {
    return {
      message: 'Esta ruta es solo para pacientes',
      user,
    };
  }

  /**
   * Ruta para Admin o Doctor (Personal médico)
   */
  @Get('medical-staff')
  @Auth(Role.admin, Role.doctor)
  getMedicalStaffData(@GetUser() user: any) {
    return {
      message: 'Esta ruta es para administradores y doctores',
      user,
    };
  }

  /**
   * Ejemplo de cómo obtener datos específicos del usuario
   */
  @Get('user-info')
  @Auth(Role.admin, Role.doctor, Role.patient)
  getUserInfo(
    @GetUser() user: any,
    @GetUser('id') userId: string,
    @GetUser('email') userEmail: string,
    @GetUser('role') userRole: string,
  ) {
    return {
      message: 'Información del usuario actual',
      fullUser: user,
      extracted: {
        id: userId,
        email: userEmail,
        role: userRole,
      },
    };
  }
}
