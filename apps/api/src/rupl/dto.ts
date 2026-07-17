import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearProductorDto {
  @IsEnum(['natural', 'asociacion', 'acfc', 'comunidad_etnica'])
  tipoPersona: string;

  @IsEnum(['CC', 'NIT', 'CE', 'Pasaporte', 'otro'])
  tipoDocumento: string;

  @IsString()
  numeroDocumento: string;

  @IsString()
  razonSocial: string;

  @IsOptional()
  @IsString()
  nombreComercial?: string;

  @IsOptional()
  @IsString()
  direccionPredio?: string;

  @IsOptional()
  @IsString()
  telefonoContacto?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  codigoVereda?: string;

  @IsString()
  codigoMunicipio: string;

  @IsString()
  codigoDepartamento: string;

  @IsOptional()
  @IsEnum(['campesino', 'pequeno', 'mediano'])
  estrato?: string;

  @IsOptional()
  @IsBoolean()
  esComunidadEtnica?: boolean;

  @IsOptional()
  @IsString()
  etnia?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitud?: number;
}

export class ActualizarProductorDto {
  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  nombreComercial?: string;

  @IsOptional()
  @IsString()
  direccionPredio?: string;

  @IsOptional()
  @IsString()
  telefonoContacto?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  codigoVereda?: string;

  @IsOptional()
  @IsEnum(['campesino', 'pequeno', 'mediano'])
  estrato?: string;

  @IsOptional()
  @IsEnum(['activo', 'inactivo', 'en_acreditacion', 'vencido'])
  estado?: string;

  @IsOptional()
  @IsBoolean()
  esComunidadEtnica?: boolean;

  @IsOptional()
  @IsString()
  etnia?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitud?: number;
}

export class BuscarProductorDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  tipoPersona?: string;

  @IsOptional()
  @IsString()
  codigoDepartamento?: string;

  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  @IsOptional()
  @IsString()
  codigoVereda?: string;

  @IsOptional()
  @IsString()
  categoriaProducto?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CrearProductoOfrecidoDto {
  @IsOptional()
  @IsString()
  productoBaseId?: string;

  @IsString()
  nombre: string;

  @IsEnum(['fruta', 'verdura', 'hortaliza', 'lacteo', 'carnes', 'granos', 'panaderia', 'preparaciones', 'bebidas', 'huevos', 'tuberculos', 'miel', 'procesado', 'otros'])
  categoria: string;

  @IsEnum(['kg', 'lb', 'unidad', 'litro', 'docena', 'arroba', 'bulto', 'caneca'])
  unidadMedida: string;

  @IsNumber()
  @Type(() => Number)
  volumenDisponible: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  volumenMinimo?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  precioReferencia?: number;

  @IsOptional()
  estacionalidad?: any;

  @IsOptional()
  atributos?: any;

  @IsOptional()
  fotos?: string[];

  @IsOptional()
  presentaciones?: {
    nombre: string;
    volumen: number;
    unidadMedida: string;
    precio: number;
    stock: number;
  }[];
}

export class CrearDocumentoDto {
  @IsEnum(['registro_ica', 'camara_comercio', 'rut', 'certificacion_bpa', 'certificacion_origen_etnico', 'certificacion_asociacion', 'otro'])
  tipo: string;

  @IsString()
  archivoUrl: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @Type(() => Number)
  tamanoBytes?: number;

  @IsString()
  fechaExpedicion: string;

  @IsOptional()
  @IsString()
  fechaVencimiento?: string;

  @IsOptional()
  @Type(() => Number)
  diasAvisoVencimiento?: number;
}

export class ActualizarDocumentoDto {
  @IsOptional()
  @IsBoolean()
  verificado?: boolean;

  @IsOptional()
  @IsString()
  verificadoPor?: string;

  @IsOptional()
  @IsString()
  fechaVencimiento?: string;
}

export class BuscarMapaDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString({ each: true })
  categorias?: string[];

  @IsOptional()
  @IsString()
  producto?: string;

  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  @IsOptional()
  @IsString()
  codigoDepartamento?: string;

  @IsOptional()
  @IsString()
  tipoPersona?: string;

  @IsOptional()
  @IsString()
  estrato?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  calificacionMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number = 200;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;
}

export class BuscarProductoDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
