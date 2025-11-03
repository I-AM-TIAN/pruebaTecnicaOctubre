import { Injectable, Logger, InternalServerErrorException, NotFoundException, ForbiddenException, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionStatus } from '@prisma/client';
import { nanoid } from 'nanoid';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

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
   * Obtener una prescripción por ID (Doctor, Patient o Admin)
   */
  async getPrescriptionById(userId: string, prescriptionId: string) {
    try {
      this.logger.log(`Usuario ${userId} obteniendo prescripción ${prescriptionId}`);

      // Verificar si es doctor, paciente o admin
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          doctor: true,
          patient: true,
        },
      });

      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }

      const isAdmin = user.role === 'admin';
      const isDoctor = !!user.doctor;
      const isPatient = !!user.patient;

      if (!isAdmin && !isDoctor && !isPatient) {
        throw new ForbiddenException('Solo los doctores, pacientes y administradores pueden ver prescripciones');
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

      // Si es paciente, verificar que la prescripción le pertenece
      // El admin y el doctor pueden ver cualquier prescripción
      if (isPatient && user.patient && prescription.patientId !== user.patient.id) {
        throw new ForbiddenException('No puedes acceder a una prescripción que no es tuya');
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

  /**
   * Obtener mis prescripciones (solo Patient)
   */
  async getMyPrescriptions(
    userId: string,
    status?: PrescriptionStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      this.logger.log(`Paciente ${userId} obteniendo sus prescripciones - status: ${status}`);

      // Obtener el patient ID
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });

      if (!patient) {
        throw new ForbiddenException('Solo los pacientes pueden ver sus prescripciones');
      }

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {
        patientId: patient.id, // Solo sus prescripciones
      };

      // Filtro por status
      if (status) {
        where.status = status;
      }

      const [prescriptions, total] = await Promise.all([
        this.prisma.prescription.findMany({
          where,
          skip,
          take: limit,
          include: {
            items: true,
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
            createdAt: 'desc',
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

      this.logger.error(`Error al obtener prescripciones del paciente: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener prescripciones');
    }
  }

  /**
   * Marcar prescripción como consumida (solo Patient y si es suya)
   */
  async consumePrescription(userId: string, prescriptionId: string) {
    try {
      this.logger.log(`Paciente ${userId} marcando prescripción ${prescriptionId} como consumida`);

      // Obtener el patient ID
      const patient = await this.prisma.patient.findUnique({
        where: { userId },
      });

      if (!patient) {
        throw new ForbiddenException('Solo los pacientes pueden consumir prescripciones');
      }

      // Verificar que la prescripción existe y pertenece al paciente
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: prescriptionId },
      });

      if (!prescription) {
        throw new NotFoundException('Prescripción no encontrada');
      }

      if (prescription.patientId !== patient.id) {
        throw new ForbiddenException('No puedes consumir una prescripción que no es tuya');
      }

      if (prescription.status === PrescriptionStatus.consumed) {
        throw new ForbiddenException('Esta prescripción ya fue consumida');
      }

      // Marcar como consumida
      const updatedPrescription = await this.prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: PrescriptionStatus.consumed,
          consumedAt: new Date(),
        },
        include: {
          items: true,
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

      this.logger.log(`Prescripción ${prescriptionId} marcada como consumida`);

      return updatedPrescription;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error al consumir prescripción: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al consumir prescripción');
    }
  }

  /**
   * Generar y descargar PDF de prescripción (Patient o Admin)
   */
  async generatePrescriptionPdf(userId: string, prescriptionId: string, res: Response) {
    try {
      this.logger.log(`Usuario ${userId} generando PDF de prescripción ${prescriptionId}`);

      // Obtener información del usuario
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          patient: true,
        },
      });

      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }

      const isAdmin = user.role === 'admin';
      const isPatient = !!user.patient;

      if (!isAdmin && !isPatient) {
        throw new ForbiddenException('Solo los pacientes y administradores pueden descargar prescripciones');
      }

      // Verificar que la prescripción existe
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: {
          items: true,
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
        },
      });

      if (!prescription) {
        throw new NotFoundException('Prescripción no encontrada');
      }

      // Si es paciente, verificar que la prescripción le pertenece
      // El admin puede descargar cualquier prescripción
      if (isPatient && user.patient && prescription.patientId !== user.patient.id) {
        throw new ForbiddenException('No puedes acceder a una prescripción que no es tuya');
      }

      // Crear PDF
      const doc = new PDFDocument({ margin: 50 });

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=prescripcion-${prescription.code}.pdf`);

      // Pipe del PDF a la respuesta
      doc.pipe(res);

      // === HEADER DEL PDF ===
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('PRESCRIPCIÓN MÉDICA', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Código: ${prescription.code}`, { align: 'center' })
        .moveDown(1);

      // Línea separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1);

      // === INFORMACIÓN DEL DOCTOR ===
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('DOCTOR:', { continued: false })
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Nombre: ${prescription.author.user.name}`)
        .text(`Especialidad: ${prescription.author.specialty || 'No especificada'}`)
        .text(`Email: ${prescription.author.user.email}`)
        .moveDown(1);

      // === INFORMACIÓN DEL PACIENTE ===
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('PACIENTE:', { continued: false })
        .moveDown(0.3);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Nombre: ${prescription.patient.user.name}`)
        .text(`Email: ${prescription.patient.user.email}`);

      if (prescription.patient.birthDate) {
        const birthDate = new Date(prescription.patient.birthDate).toLocaleDateString('es-ES');
        doc.text(`Fecha de Nacimiento: ${birthDate}`);
      }

      doc.moveDown(1);

      // Línea separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(1);

      // === FECHA DE EMISIÓN ===
      const createdDate = new Date(prescription.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Fecha de Emisión: ${createdDate}`)
        .moveDown(0.5);

      // Estado
      const statusText = prescription.status === 'consumed' ? 'CONSUMIDA' : 'PENDIENTE';
      const statusColor = prescription.status === 'consumed' ? '#808080' : '#28a745';
      
      doc
        .fillColor(statusColor)
        .font('Helvetica-Bold')
        .text(`Estado: ${statusText}`)
        .fillColor('#000000')
        .font('Helvetica');

      if (prescription.consumedAt) {
        const consumedDate = new Date(prescription.consumedAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        doc.text(`Fecha de Consumo: ${consumedDate}`);
      }

      doc.moveDown(1);

      // === MEDICAMENTOS ===
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('MEDICAMENTOS PRESCRITOS:', { continued: false })
        .moveDown(0.5);

      prescription.items.forEach((item, index) => {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(`${index + 1}. ${item.name}`, { continued: false })
          .moveDown(0.2);

        doc.fontSize(10).font('Helvetica');

        if (item.dosage) {
          doc.text(`   Dosificación: ${item.dosage}`);
        }

        if (item.quantity) {
          doc.text(`   Cantidad: ${item.quantity} unidades`);
        }

        if (item.instructions) {
          doc.text(`   Instrucciones: ${item.instructions}`);
        }

        doc.moveDown(0.8);
      });

      // === NOTAS ADICIONALES ===
      if (prescription.notes) {
        doc.moveDown(0.5);
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('NOTAS:', { continued: false })
          .moveDown(0.3);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(prescription.notes, { align: 'left' })
          .moveDown(1);
      }

      // === FOOTER ===
      const bottomY = doc.page.height - 100;
      
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Este documento es una prescripción médica oficial. Consérvelo para el suministro de medicamentos.',
          50,
          bottomY,
          { align: 'center', width: 500 }
        )
        .moveDown(0.5);

      doc
        .fontSize(8)
        .text(`Generado el ${new Date().toLocaleString('es-ES')}`, { align: 'center' });

      // Finalizar el PDF
      doc.end();

      this.logger.log(`PDF generado exitosamente para prescripción ${prescriptionId}`);
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error al generar PDF: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al generar PDF de prescripción');
    }
  }

  /**
   * Obtener todas las prescripciones con filtros (solo Admin)
   */
  async getAllPrescriptions(
    status?: PrescriptionStatus,
    doctorId?: string,
    patientId?: string,
    from?: string,
    to?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      this.logger.log(`Admin obteniendo prescripciones - status: ${status}, doctorId: ${doctorId}, patientId: ${patientId}`);

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};

      // Filtro por status
      if (status) {
        where.status = status;
      }

      // Filtro por doctor (authorId en la tabla prescriptions)
      if (doctorId) {
        where.authorId = doctorId;
      }

      // Filtro por paciente
      if (patientId) {
        where.patientId = patientId;
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
            createdAt: 'desc',
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
      this.logger.error(`Error al obtener prescripciones (admin): ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al obtener prescripciones');
    }
  }
}
