import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CrearActaDto {
  @IsString()
  ordenId: string;

  @IsString()
  fechaVisita: string;

  @IsOptional()
  @IsObject()
  geolocalizacion?: Record<string, any>;

  @IsOptional()
  @IsArray()
  itemsVerificados?: any[];

  @IsOptional()
  @IsString()
  firmaInterventorUrl?: string;

  @IsOptional()
  @IsString()
  firmaProductorUrl?: string;

  @IsOptional()
  @IsString()
  actaPdfUrl?: string;
}

export class ActualizarActaDto {
  @IsOptional()
  @IsArray()
  itemsVerificados?: any[];

  @IsOptional()
  @IsString()
  firmaInterventorUrl?: string;

  @IsOptional()
  @IsString()
  firmaProductorUrl?: string;

  @IsOptional()
  @IsString()
  actaPdfUrl?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}
