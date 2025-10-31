import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule, PatientsModule, DoctorsModule, PrescriptionsModule],
})
export class AppModule {}
