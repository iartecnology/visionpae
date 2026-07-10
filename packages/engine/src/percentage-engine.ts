import {
  DatosOrden,
  DatosMensuales,
  EscenarioSimulacion,
  EstadoAlerta,
  ResultadoCumplimiento,
  ResultadoSimulacion,
} from './types';

export class PercentageEngine {
  constructor(private readonly meta: number = 0.30) {}

  calcular(ordenes: DatosOrden[]): ResultadoCumplimiento {
    const total = ordenes.reduce((s, o) => s + o.valorTotal, 0);
    const local = ordenes.filter((o) => o.esLocal).reduce((s, o) => s + o.valorTotal, 0);
    const porcentaje = total > 0 ? local / total : 0;

    return {
      porcentaje: Math.round(porcentaje * 10000) / 10000,
      meta: this.meta,
      delta: Math.round((porcentaje - this.meta) * 10000) / 10000,
      gastoTotal: total,
      gastoLocal: local,
      estado: this.determinarAlerta(porcentaje),
      proyeccion: this.proyectar(ordenes),
    };
  }

  simular(ordenesActuales: DatosOrden[], escenario: EscenarioSimulacion): ResultadoSimulacion {
    const actual = this.calcular(ordenesActuales);

    const nuevaOrden: DatosOrden = {
      id: 'simulada',
      valorTotal: escenario.cantidad * escenario.precioUnitario,
      esLocal: escenario.esLocal,
      fecha: new Date(),
    };

    const simulado = this.calcular([...ordenesActuales, nuevaOrden]);

    return {
      resultadoActual: actual,
      resultadoSimulado: simulado,
      impactoDelta: Math.round((simulado.delta - actual.delta) * 10000) / 10000,
    };
  }

  private proyectar(ordenes: DatosOrden[]): null {
    if (ordenes.length < 2) return null;
    return null;
  }

  private determinarAlerta(porcentaje: number): EstadoAlerta {
    if (porcentaje >= this.meta * 0.93) return 'verde';
    if (porcentaje >= this.meta * 0.83) return 'amarillo';
    return 'rojo';
  }

  private agruparPorMes(ordenes: DatosOrden[]): DatosMensuales[] {
    const mapa = new Map<string, { gastoTotal: number; gastoLocal: number }>();

    for (const orden of ordenes) {
      const mes = orden.fecha.toISOString().slice(0, 7);
      const actual = mapa.get(mes) || { gastoTotal: 0, gastoLocal: 0 };
      actual.gastoTotal += orden.valorTotal;
      if (orden.esLocal) actual.gastoLocal += orden.valorTotal;
      mapa.set(mes, actual);
    }

    return Array.from(mapa.entries())
      .map(([mes, datos]) => ({ mes, ...datos }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }
}
