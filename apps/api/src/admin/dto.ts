import { IsString, IsOptional, IsEnum, IsBoolean, IsEmail, MinLength } from 'class-validator';

export class CrearTenantDto {
  @IsString()
  nombre: string;

  @IsString()
  slug: string;

  @IsString()
  codigoDane: string;

  @IsString()
  departamento: string;

  @IsEnum(['municipio', 'operador_pae', 'secretaria_educacion', 'gobernacion', 'hospital', 'icbf'])
  tipo: string;

  @IsOptional()
  config?: Record<string, unknown>;
}

export class ActualizarTenantDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  codigoDane?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsEnum(['municipio', 'operador_pae', 'secretaria_educacion', 'gobernacion', 'hospital', 'icbf'])
  tipo?: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CrearUsuarioDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nombreCompleto: string;

  @IsEnum(['CC', 'NIT', 'CE', 'Pasaporte', 'otro'])
  tipoDocumento: string;

  @IsString()
  numeroDocumento: string;

  @IsEnum(['admin_entidad', 'operador', 'productor', 'interventor', 'auditor', 'mesa_tecnica'])
  rol: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  nombreCompleto?: string;

  @IsOptional()
  @IsEnum(['CC', 'NIT', 'CE', 'Pasaporte', 'otro'])
  tipoDocumento?: string;

  @IsOptional()
  @IsString()
  numeroDocumento?: string;

  @IsOptional()
  @IsEnum(['admin_entidad', 'operador', 'productor', 'interventor', 'auditor', 'mesa_tecnica'])
  rol?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
