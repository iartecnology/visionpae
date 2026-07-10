import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearIncidenciaDto {
  @IsString()
  ordenId: string;

  @IsEnum(['calidad_insuficiente', 'retraso_entrega', 'cantidad_incompleta', 'producto_no_corresponde', 'empaque_inadecuado', 'otra'])
  tipo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotoUrls?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitud?: number;
}

export class ResolverIncidenciaDto {
  @IsEnum(['abierta', 'en_gestion', 'resuelta', 'cerrada'])
  estado: string;

  @IsOptional()
  @IsString()
  resolucion?: string;
}
