import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearCertificacionDto {
  @IsString()
  contratoId: string;

  @IsEnum(['fruta', 'verdura', 'lacteo', 'carnes', 'granos', 'panaderia', 'preparaciones', 'bebidas', 'huevos', 'tuberculos', 'otros'])
  productoCategoria: string;

  @IsNumber()
  @Type(() => Number)
  volumenRequeridoMensual: number;

  @IsDateString()
  periodoInicio: string;

  @IsDateString()
  periodoFin: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductorReferenciadoDto)
  productoresNoLocales?: ProductorReferenciadoDto[];
}

export class ProductorReferenciadoDto {
  @IsString()
  nombre: string;

  @IsString()
  ubicacion: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsString()
  municipio?: string;

  @IsArray()
  @IsString({ each: true })
  productosOfrecidos: string[];

  @IsNumber()
  @Type(() => Number)
  volumenDisponible: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  precioReferencia?: number;

  @IsOptional()
  @IsString()
  justificacion?: string;
}
