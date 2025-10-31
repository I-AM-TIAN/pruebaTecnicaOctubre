import { PrismaClient, Role, PrescriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Hashear contraseñas
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedDoctorPassword = await bcrypt.hash('dr123', 10);
  const hashedPatientPassword = await bcrypt.hash('patient123', 10);

  // Crear Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedAdminPassword,
      name: 'Administrador Principal',
      role: Role.admin,
    },
  });
  console.log('👤 Admin creado:', admin.email);

  // Crear Doctor
  const doctorUser = await prisma.user.create({
    data: {
      email: 'dr@test.com',
      password: hashedDoctorPassword,
      name: 'Dr. Juan Pérez',
      role: Role.doctor,
      doctor: {
        create: {
          specialty: 'Medicina General',
        },
      },
    },
    include: {
      doctor: true,
    },
  });
  console.log('👨‍⚕️ Doctor creado:', doctorUser.email);

  // Crear Paciente
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@test.com',
      password: hashedPatientPassword,
      name: 'María García',
      role: Role.patient,
      patient: {
        create: {
          birthDate: new Date('1990-05-15'),
        },
      },
    },
    include: {
      patient: true,
    },
  });
  console.log('👩 Paciente creado:', patientUser.email);

  // Crear 5-10 prescripciones de ejemplo
  const prescriptions: any[] = [];

  // Prescripción 1 - Pending
  const prescription1 = await prisma.prescription.create({
    data: {
      code: 'RX-2024-001',
      status: PrescriptionStatus.pending,
      notes: 'Tomar con alimentos',
      patientId: patientUser.patient!.id,
      authorId: doctorUser.doctor!.id,
      items: {
        create: [
          {
            name: 'Paracetamol 500mg',
            dosage: '1 tableta cada 8 horas',
            quantity: 30,
            instructions: 'Tomar después de las comidas',
          },
          {
            name: 'Ibuprofeno 400mg',
            dosage: '1 tableta cada 12 horas',
            quantity: 20,
            instructions: 'Solo en caso de dolor',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  prescriptions.push(prescription1);

  // Prescripción 2 - Consumed
  const prescription2 = await prisma.prescription.create({
    data: {
      code: 'RX-2024-002',
      status: PrescriptionStatus.consumed,
      notes: 'Completado el tratamiento',
      consumedAt: new Date('2024-10-15'),
      patientId: patientUser.patient!.id,
      authorId: doctorUser.doctor!.id,
      items: {
        create: [
          {
            name: 'Amoxicilina 500mg',
            dosage: '1 cápsula cada 8 horas',
            quantity: 21,
            instructions: 'Completar todo el tratamiento de 7 días',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  prescriptions.push(prescription2);

  // Prescripción 3 - Pending
  const prescription3 = await prisma.prescription.create({
    data: {
      code: 'RX-2024-003',
      status: PrescriptionStatus.pending,
      notes: 'Control en 15 días',
      patientId: patientUser.patient!.id,
      authorId: doctorUser.doctor!.id,
      items: {
        create: [
          {
            name: 'Omeprazol 20mg',
            dosage: '1 cápsula en ayunas',
            quantity: 30,
            instructions: 'Tomar 30 minutos antes del desayuno',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  prescriptions.push(prescription3);

  // Prescripción 4 - Consumed
  const prescription4 = await prisma.prescription.create({
    data: {
      code: 'RX-2024-004',
      status: PrescriptionStatus.consumed,
      notes: 'Tratamiento completado satisfactoriamente',
      consumedAt: new Date('2024-09-20'),
      patientId: patientUser.patient!.id,
      authorId: doctorUser.doctor!.id,
      items: {
        create: [
          {
            name: 'Loratadina 10mg',
            dosage: '1 tableta al día',
            quantity: 10,
            instructions: 'Tomar por la noche',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  prescriptions.push(prescription4);

  // Prescripción 5 - Pending
  const prescription5 = await prisma.prescription.create({
    data: {
      code: 'RX-2024-005',
      status: PrescriptionStatus.pending,
      notes: 'Tratamiento para hipertensión',
      patientId: patientUser.patient!.id,
      authorId: doctorUser.doctor!.id,
      items: {
        create: [
          {
            name: 'Enalapril 10mg',
            dosage: '1 tableta al día',
            quantity: 30,
            instructions: 'Tomar por la mañana',
          },
          {
            name: 'Aspirina 100mg',
            dosage: '1 tableta al día',
            quantity: 30,
            instructions: 'Tomar con el desayuno',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  prescriptions.push(prescription5);

  // Prescripción 6 - Pending
  const prescription6 = await prisma.prescription.create({
    data: {
      code: 'RX-2024-006',
      status: PrescriptionStatus.pending,
      notes: 'Vitaminas y suplementos',
      patientId: patientUser.patient!.id,
      authorId: doctorUser.doctor!.id,
      items: {
        create: [
          {
            name: 'Complejo B',
            dosage: '1 tableta al día',
            quantity: 30,
            instructions: 'Tomar con el almuerzo',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  prescriptions.push(prescription6);

  // Prescripción 7 - Consumed
  const prescription7 = await prisma.prescription.create({
    data: {
      code: 'RX-2024-007',
      status: PrescriptionStatus.consumed,
      notes: 'Tratamiento agudo completado',
      consumedAt: new Date('2024-10-01'),
      patientId: patientUser.patient!.id,
      authorId: doctorUser.doctor!.id,
      items: {
        create: [
          {
            name: 'Cetirizina 10mg',
            dosage: '1 tableta cada 24 horas',
            quantity: 7,
            instructions: 'Tomar antes de dormir',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  prescriptions.push(prescription7);

  // Prescripción 8 - Pending
  const prescription8 = await prisma.prescription.create({
    data: {
      code: 'RX-2024-008',
      status: PrescriptionStatus.pending,
      notes: 'Control mensual requerido',
      patientId: patientUser.patient!.id,
      authorId: doctorUser.doctor!.id,
      items: {
        create: [
          {
            name: 'Metformina 850mg',
            dosage: '1 tableta con cada comida principal',
            quantity: 90,
            instructions: 'Tomar con desayuno, almuerzo y cena',
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  prescriptions.push(prescription8);

  console.log(`💊 ${prescriptions.length} prescripciones creadas`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log('  - 1 Administrador');
  console.log('  - 1 Doctor');
  console.log('  - 1 Paciente');
  console.log(`  - ${prescriptions.length} Prescripciones`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('  Admin: admin@test.com / admin123');
  console.log('  Doctor: dr@test.com / dr123');
  console.log('  Paciente: patient@test.com / patient123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
