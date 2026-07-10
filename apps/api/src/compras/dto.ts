import {
  IsString, IsEnum, IsNumber, IsOptional, IsDateString,
  IsArray, IsBoolean, ValidateNested, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearItemOrdenDto {
  @IsString()
  productoId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cantidad: number;

  @IsEnum(['kg', 'lb', 'unidad', 'litro', 'docena', 'arroba', 'bulto', 'caneca'])
  unidadMedida: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precioUnitario: number;
}

export class CrearOrdenDto {
  @IsString()
  contratoId: string;

  @IsString()
  productorId: string;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @IsDateString()
  fechaEntregaProgramada: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearItemOrdenDto)
  items: CrearItemOrdenDto[];

  @IsOptional()
  @IsString()
  certificacionId?: string;
}

export class CrearContratoDto {
  @IsString()
  numero: string;

  @IsString()
  operadorId: string;

  @IsString()
  objeto: string;

  @IsDateString()
  periodoInicio: string;

  @IsDateString()
  periodoFin: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valorTotal: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  presupuestoComprasLocales: number;

  @IsOptional()
  @IsEnum(['anual', 'semestral', 'trimestral'])
  tipo?: string;
}

export class ActualizarContratoDto {
  @IsOptional()
  @IsString()
  objeto?: string;

  @IsOptional()
  @IsDateString()
  periodoInicio?: string;

  @IsOptional()
  @IsDateString()
  periodoFin?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  valorTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  presupuestoComprasLocales?: number;

  @IsOptional()
  @IsEnum(['anual', 'semestral', 'trimestral'])
  tipo?: string;

  @IsOptional()
  @IsEnum(['borrador', 'vigente', 'cerrado', 'anulado'])
  estado?: string;
}

export class SimularOrdenDto {
  @IsOptional()
  @IsString()
  contratoId?: string;

  @IsString()
  productorId: string;

  @IsNumber()
  @Type(() => Number)
  valorTotal: number;

  @IsBoolean()
  esLocal: boolean;
}
