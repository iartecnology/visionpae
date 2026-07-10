import { describe, it, expect } from 'vitest';
import { PercentageEngine } from './percentage-engine';
import { DatosOrden } from './types';

function mockOrdenes(overrides: Partial<DatosOrden>[] = []): DatosOrden[] {
  const base: DatosOrden[] = [
    { id: '1', valorTotal: 1000000, esLocal: true, fecha: new Date('2024-01-15') },
    { id: '2', valorTotal: 500000, esLocal: false, fecha: new Date('2024-01-20') },
    { id: '3', valorTotal: 800000, esLocal: true, fecha: new Date('2024-02-10') },
    { id: '4', valorTotal: 1200000, esLocal: false, fecha: new Date('2024-02-25') },
    { id: '5', valorTotal: 600000, esLocal: true, fecha: new Date('2024-03-05') },
  ];
  return base.map((o, i) => ({ ...o, ...overrides[i] }));
}

describe('PercentageEngine', () => {
  const engine = new PercentageEngine(0.30);

  it('debe calcular el porcentaje correcto', () => {
    const ordernes = mockOrdenes();
    // Total: 1M + 500k + 800k + 1.2M + 600k = 4.1M
    // Local: 1M + 800k + 600k = 2.4M
    // % = 2.4 / 4.1 = 58.54%
    const result = engine.calcular(ordernes);
    expect(result.gastoTotal).toBe(4100000);
    expect(result.gastoLocal).toBe(2400000);
    expect(result.porcentaje).toBeCloseTo(0.5854, 3);
  });

  it('debe retornar 0% si no hay órdenes', () => {
    const result = engine.calcular([]);
    expect(result.porcentaje).toBe(0);
    expect(result.gastoTotal).toBe(0);
    expect(result.gastoLocal).toBe(0);
  });

  it('debe marcar alerta roja si está muy por debajo de la meta', () => {
    const ordenes: DatosOrden[] = [
      { id: '1', valorTotal: 1000000, esLocal: false, fecha: new Date() },
      { id: '2', valorTotal: 1000000, esLocal: false, fecha: new Date() },
    ];
    const result = engine.calcular(ordenes);
    expect(result.estado).toBe('rojo');
    expect(result.delta).toBe(-0.30);
  });

  it('debe simular el impacto de una nueva orden local', () => {
    const ordenes = mockOrdenes().slice(0, 2);
    const actual = engine.calcular(ordenes);
    // 1M local + 500k no local = 66.67%
    expect(actual.porcentaje).toBeCloseTo(0.6667, 3);

    const simulacion = engine.simular(ordenes, {
      nuevoProductorId: 'nuevo',
      productoCategoria: 'verdura',
      cantidad: 100,
      precioUnitario: 5000,
      esLocal: true,
    });
    // Nueva orden: 500k local
    // Total: 1.5M + 500k = 2M
    // Local: 1M + 500k = 1.5M
    // % = 75%
    expect(simulacion.resultadoSimulado.porcentaje).toBeCloseTo(0.75, 3);
    expect(simulacion.impactoDelta).toBeGreaterThan(0);
  });
});
