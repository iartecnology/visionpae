import { OrdenEvaluacion, EvaluacionLocalidad } from './types';

export interface ConfiguracionLocalidad {
  radioKm: number;
  usarRadioLimite: boolean;
  permitirMismoDepartamentoConCertificacion: boolean;
}

export class LocalidadEngine {
  constructor(private readonly config: ConfiguracionLocalidad) {}

  evaluar(input: OrdenEvaluacion): EvaluacionLocalidad {
    const ahora = new Date();

    if (this.esMismoMunicipio(input)) {
      return {
        esLocal: true,
        fundamentoLegal: 'Art. 2 Ley 2046 — Productor del mismo municipio',
        fechaCalculo: ahora,
      };
    }

    if (this.config.usarRadioLimite && this.dentroRadio(input)) {
      return {
        esLocal: true,
        fundamentoLegal: `Art. 5 Ley 2046 — Vereda limítrofe dentro de ${this.config.radioKm}km`,
        radioKm: this.config.radioKm,
        fechaCalculo: ahora,
      };
    }

    if (
      this.config.permitirMismoDepartamentoConCertificacion &&
      this.esMismoDepartamento(input) &&
      input.tieneCertificacionInsuficiencia
    ) {
      return {
        esLocal: true,
        fundamentoLegal: 'Art. 11 Ley 2046 + Certificación de insuficiencia de oferta local',
        fechaCalculo: ahora,
      };
    }

    return {
      esLocal: false,
      fundamentoLegal: 'No cumple criterios de localidad según Ley 2046',
      fechaCalculo: ahora,
    };
  }

  private esMismoMunicipio(input: OrdenEvaluacion): boolean {
    return input.productorCodigoMunicipio === input.entidadCodigoMunicipio;
  }

  private esMismoDepartamento(input: OrdenEvaluacion): boolean {
    return input.productorCodigoDepartamento === input.entidadCodigoDepartamento;
  }

  private dentroRadio(input: OrdenEvaluacion): boolean {
    if (input.productorLat === 0 || input.productorLng === 0) return false;
    const distancia = this.haversine(
      input.productorLat,
      input.productorLng,
      0, // centroide del municipio — se resolvería con PostGIS
      0,
    );
    return distancia <= this.config.radioKm;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
