import { describe, it, expect } from 'vitest';
import { LocalidadEngine } from './localidad-engine';
import { OrdenEvaluacion } from './types';

function mockOrden(overrides: Partial<OrdenEvaluacion> = {}): OrdenEvaluacion {
  return {
    ordenId: 'test-1',
    productorCodigoVereda: '15001001',
    productorCodigoMunicipio: '15001',
    productorCodigoDepartamento: '15',
    productorLat: 5.532,
    productorLng: -73.361,
    entidadCodigoMunicipio: '15001',
    entidadCodigoDepartamento: '15',
    fechaEntrega: new Date(),
    tieneCertificacionInsuficiencia: false,
    ...overrides,
  };
}

describe('LocalidadEngine', () => {
  const engine = new LocalidadEngine({
    radioKm: 15,
    usarRadioLimite: true,
    permitirMismoDepartamentoConCertificacion: true,
  });

  it('debe clasificar como LOCAL un productor del mismo municipio', () => {
    const result = engine.evaluar(mockOrden({
      productorCodigoMunicipio: '15001',
      entidadCodigoMunicipio: '15001',
    }));
    expect(result.esLocal).toBe(true);
    expect(result.fundamentoLegal).toContain('Art. 2');
  });

  it('debe clasificar como NO LOCAL si es otro departamento sin certificación', () => {
    const result = engine.evaluar(mockOrden({
      productorCodigoMunicipio: '25001',
      productorCodigoDepartamento: '25',
      entidadCodigoMunicipio: '15001',
      entidadCodigoDepartamento: '15',
      tieneCertificacionInsuficiencia: false,
    }));
    expect(result.esLocal).toBe(false);
  });

  it('debe clasificar como LOCAL si mismo departamento con certificación', () => {
    const result = engine.evaluar(mockOrden({
      productorCodigoMunicipio: '15238',
      productorCodigoDepartamento: '15',
      entidadCodigoMunicipio: '15001',
      entidadCodigoDepartamento: '15',
      tieneCertificacionInsuficiencia: true,
    }));
    expect(result.esLocal).toBe(true);
    expect(result.fundamentoLegal).toContain('Art. 11');
  });

  it('debe clasificar como NO LOCAL si mismo departamento sin certificación', () => {
    const result = engine.evaluar(mockOrden({
      productorCodigoMunicipio: '15238',
      entidadCodigoMunicipio: '15001',
      tieneCertificacionInsuficiencia: false,
    }));
    expect(result.esLocal).toBe(false);
  });
});
