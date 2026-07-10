export interface OrdenEvaluacion {
  ordenId: string;
  productorCodigoVereda: string;
  productorCodigoMunicipio: string;
  productorCodigoDepartamento: string;
  productorLat: number;
  productorLng: number;
  entidadCodigoMunicipio: string;
  entidadCodigoDepartamento: string;
  fechaEntrega: Date;
  tieneCertificacionInsuficiencia: boolean;
}

export interface EvaluacionLocalidad {
  esLocal: boolean;
  fundamentoLegal: string;
  radioKm?: number;
  certificacionId?: string;
  fechaCalculo: Date;
}

export interface ResultadoCumplimiento {
  porcentaje: number;
  meta: number;
  delta: number;
  gastoTotal: number;
  gastoLocal: number;
  estado: EstadoAlerta;
  proyeccion: Proyeccion | null;
}

export interface Proyeccion {
  porcentajeProyectado: number;
  confianza: number;
}

export interface EscenarioSimulacion {
  nuevoProductorId: string;
  productoCategoria: string;
  cantidad: number;
  precioUnitario: number;
  esLocal: boolean;
}

export interface ResultadoSimulacion {
  resultadoActual: ResultadoCumplimiento;
  resultadoSimulado: ResultadoCumplimiento;
  impactoDelta: number;
}

export interface DatosOrden {
  id: string;
  valorTotal: number;
  esLocal: boolean;
  fecha: Date;
}

export interface DatosMensuales {
  mes: string;
  gastoTotal: number;
  gastoLocal: number;
}

export type EstadoAlerta = 'verde' | 'amarillo' | 'rojo';
