import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearRuedaDto {
  @IsString()
  nombre: string;

  @IsString()
  fecha: string;

  @IsString()
  lugar: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(['presencial', 'virtual', 'mixta'])
  tipo?: string;
}

export class ActualizarRuedaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(['presencial', 'virtual', 'mixta'])
  tipo?: string;

  @IsOptional()
  @IsEnum(['programada', 'activa', 'finalizada', 'cancelada'])
  estado?: string;
}

export class CrearDemandaDto {
  @IsString()
  entidadNombre: string;

  @IsOptional()
  @IsString()
  entidadMunicipio?: string;

  @IsArray()
  productosRequeridos: Record<string, unknown>[];
}

export class CrearMatchDto {
  @IsString()
  demandaId: string;

  @IsString()
  productorId: string;

  @IsString()
  productoMatch: string;

  @IsNumber()
  @Type(() => Number)
  volumenOfrecido: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  precioOfertado?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  distanciaKm?: number;
}
