import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PrescriptionItemDto {
  @ApiProperty({
    description: 'Nombre del medicamento',
    example: 'Paracetamol 500mg',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Dosis del medicamento',
    example: '1 tableta cada 8 horas',
    required: false,
  })
  @IsString()
  @IsOptional()
  dosage?: string;

  @ApiProperty({
    description: 'Cantidad de unidades',
    example: 20,
    required: false,
  })
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: 'Instrucciones adicionales',
    example: 'Tomar con alimentos',
    required: false,
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: 'cm2xzy6e40003u2k6xyz',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Notas o diagnóstico',
    example: 'Gripe común - Reposo y abundante líquido',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Lista de medicamentos prescritos',
    type: [PrescriptionItemDto],
    example: [
      {
        name: 'Paracetamol 500mg',
        dosage: '1 tableta cada 8 horas',
        quantity: 20,
        instructions: 'Tomar con alimentos'
      }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}