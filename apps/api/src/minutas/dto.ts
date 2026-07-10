import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearRecetaDto {
  @IsString()
  nombre: string;

  @IsEnum(['desayuno', 'almuerzo', 'cena', 'refrigerio'])
  categoriaComida: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  porciones: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tiempoPreparacionMin: number;

  @IsString()
  instrucciones: string;

  @IsOptional()
  @IsEnum(['baja', 'media', 'alta'])
  dificultad?: string;

  @IsOptional()
  valorNutricional?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  temporadaRecomendada?: number[];

  @IsOptional()
  @IsArray()
  etiquetaCultural?: string[];

  @IsOptional()
  ingredientes?: CrearIngredienteDto[];
}

export class ActualizarRecetaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(['desayuno', 'almuerzo', 'cena', 'refrigerio'])
  categoriaComida?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  porciones?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tiempoPreparacionMin?: number;

  @IsOptional()
  @IsString()
  instrucciones?: string;

  @IsOptional()
  @IsEnum(['baja', 'media', 'alta'])
  dificultad?: string;

  @IsOptional()
  valorNutricional?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  temporadaRecomendada?: number[];

  @IsOptional()
  @IsArray()
  etiquetaCultural?: string[];

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  ingredientes?: CrearIngredienteDto[];
}

export class CrearIngredienteDto {
  @IsString()
  categoriaProducto: string;

  @IsString()
  nombre: string;

  @IsNumber()
  @Type(() => Number)
  cantidad: number;

  @IsEnum(['kg', 'lb', 'unidad', 'litro', 'docena', 'arroba', 'bulto', 'caneca'])
  unidad: string;

  @IsOptional()
  @IsBoolean()
  opcional?: boolean;

  @IsOptional()
  @IsString()
  sustitutoPosible?: string;
}

export class CrearPlanSemanalDto {
  @IsString()
  nombre: string;

  @IsString()
  fechaInicio: string;

  @IsString()
  fechaFin: string;

  @IsOptional()
  requerimientosNutricionales?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class AgregarItemPlanDto {
  @IsString()
  recetaId: string;

  @IsNumber()
  @Type(() => Number)
  diaSemana: number;

  @IsEnum(['desayuno', 'almuerzo', 'cena', 'refrigerio'])
  tipoComida: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  porcionesEstimadas: number;

  @IsOptional()
  @IsBoolean()
  generadoAuto?: boolean;
}
