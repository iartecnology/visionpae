import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LocalidadEngine, PercentageEngine, DatosOrden } from '@pae/engine';
import { CrearOrdenDto, SimularOrdenDto } from './dto';

@Injectable()
export class ComprasService {
  private readonly localidadEngine: LocalidadEngine;
  private readonly percentageEngine: PercentageEngine;

  constructor(private readonly prisma: PrismaService) {
    this.localidadEngine = new LocalidadEngine({
      radioKm: 15,
      usarRadioLimite: true,
      permitirMismoDepartamentoConCertificacion: true,
    });
    this.percentageEngine = new PercentageEngine(0.30);
  }

  async crearOrden(dto: CrearOrdenDto, userId: string, tenantId: string) {
    const contrato = await this.prisma.contratoMarco.findFirst({
      where: { id: dto.contratoId, tenantId },
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    const productor = await this.prisma.productor.findFirst({
      where: { id: dto.productorId, tenantId },
    });
    if (!productor) throw new NotFoundException('Productor no encontrado');

    const productoIds = dto.items.map((i) => i.productoId);
    const productos = await this.prisma.productoOfrecido.findMany({
      where: { id: { in: productoIds }, tenantId },
    });
    const productoMap = new Map(productos.map((p: { id: string; nombre: string }) => [p.id, p.nombre]));

    const valorTotal = dto.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

    const evaluacion = this.localidadEngine.evaluar({
      ordenId: 'new',
      productorCodigoVereda: productor.codigoVereda || '',
      productorCodigoMunicipio: productor.codigoMunicipio,
      productorCodigoDepartamento: productor.codigoDepartamento,
      productorLat: 0,
      productorLng: 0,
      entidadCodigoMunicipio: '15001',
      entidadCodigoDepartamento: '15',
      fechaEntrega: new Date(dto.fechaEntregaProgramada),
      tieneCertificacionInsuficiencia: !!dto.certificacionId,
    });

    const orden = await this.prisma.ordenCompra.create({
      data: {
        tenantId,
        contratoId: dto.contratoId,
        numero: `OC-${Date.now()}`,
        productorId: dto.productorId,
        fechaEmision: dto.fechaEmision ? new Date(dto.fechaEmision) : new Date(),
        fechaEntregaProgramada: new Date(dto.fechaEntregaProgramada),
        valorTotal,
        esLocal: evaluacion.esLocal,
        fundamentoLegal: evaluacion.fundamentoLegal,
        certificacionId: dto.certificacionId,
        estado: 'emitida',
        creadoPor: userId,
        items: {
          create: dto.items.map((item) => ({
            nombreProducto: productoMap.get(item.productoId) || '',
            cantidadSolicitada: item.cantidad,
            unidadMedida: item.unidadMedida as any,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
            producto: { connect: { id: item.productoId } },
          }) as any),
        },
      },
      include: { items: true, productor: true },
    });

    await this.prisma.transaccionHistorial.create({
      data: {
        tenantId,
        productorId: dto.productorId,
        ordenId: orden.id,
        tipo: 'venta',
        monto: valorTotal,
        volumen: 0,
        fecha: new Date(),
      },
    });

    return orden;
  }

  async listarOrdenes(contratoId: string, tenantId: string) {
    return this.prisma.ordenCompra.findMany({
      where: { contratoId, tenantId },
      include: {
        productor: { select: { razonSocial: true, numeroDocumento: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listarContratos(tenantId: string) {
    return this.prisma.contratoMarco.findMany({
      where: { tenantId },
      select: {
        id: true, numero: true, valorTotal: true, presupuestoComprasLocales: true,
        tipo: true, estado: true, periodoInicio: true, periodoFin: true,
        objeto: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async crearContrato(data: any, userId: string, tenantId: string) {
    return this.prisma.contratoMarco.create({
      data: {
        ...data,
        periodoInicio: new Date(data.periodoInicio),
        periodoFin: new Date(data.periodoFin),
        createdBy: userId,
        tenantId,
      },
    });
  }

  async obtenerContrato(id: string, tenantId: string) {
    const contrato = await this.prisma.contratoMarco.findFirst({
      where: { id, tenantId },
      include: {
        ordenes: {
          include: {
            productor: { select: { razonSocial: true, numeroDocumento: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { ordenes: true } },
      },
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');
    return contrato;
  }

  async actualizarContrato(id: string, data: any, tenantId: string) {
    const contrato = await this.prisma.contratoMarco.findFirst({ where: { id, tenantId } });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    const updateData: any = { ...data };
    if (data.periodoInicio) updateData.periodoInicio = new Date(data.periodoInicio);
    if (data.periodoFin) updateData.periodoFin = new Date(data.periodoFin);

    return this.prisma.contratoMarco.update({
      where: { id },
      data: updateData,
    });
  }

  async obtenerOrden(id: string, tenantId: string) {
    const orden = await this.prisma.ordenCompra.findFirst({
      where: { id, tenantId },
      include: {
        productor: { select: { razonSocial: true, numeroDocumento: true, codigoMunicipio: true } },
        items: true,
      },
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }

  async listarTodas(tenantId: string) {
    return this.prisma.ordenCompra.findMany({
      where: { tenantId },
      include: {
        productor: { select: { razonSocial: true, numeroDocumento: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerCumplimiento(contratoId: string, tenantId: string) {
    const contrato = await this.prisma.contratoMarco.findFirst({
      where: { id: contratoId, tenantId },
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    const ordenes = await this.prisma.ordenCompra.findMany({
      where: {
        contratoId,
        tenantId,
        estado: { notIn: ['borrador', 'anulada'] },
      },
    });

    const datos: DatosOrden[] = ordenes.map((o) => ({
      id: o.id,
      valorTotal: Number(o.valorTotal),
      esLocal: o.esLocal,
      fecha: o.fechaEmision,
    }));

    const resultado = this.percentageEngine.calcular(datos);

    return {
      contrato: {
        numero: contrato.numero,
        valorTotal: contrato.valorTotal,
        presupuestoLocal: contrato.presupuestoComprasLocales,
      },
      cumplimiento: {
        ...resultado,
        porcentaje: Number((resultado.porcentaje * 100).toFixed(1)),
        meta: resultado.meta * 100,
        delta: Number((resultado.delta * 100).toFixed(1)),
        gastoTotal: Number(resultado.gastoTotal.toFixed(0)),
        gastoLocal: Number(resultado.gastoLocal.toFixed(0)),
      },
      totalOrdenes: ordenes.length,
    };
  }

  async simularEscenario(dto: SimularOrdenDto, tenantId: string) {
    const ordenes = await this.prisma.ordenCompra.findMany({
      where: {
        contratoId: dto.contratoId,
        tenantId,
        estado: { notIn: ['borrador', 'anulada'] },
      },
    });

    const datos: DatosOrden[] = ordenes.map((o) => ({
      id: o.id,
      valorTotal: Number(o.valorTotal),
      esLocal: o.esLocal,
      fecha: o.fechaEmision,
    }));

    const simulacion = this.percentageEngine.simular(datos, {
      nuevoProductorId: dto.productorId,
      productoCategoria: 'otros',
      cantidad: 1,
      precioUnitario: dto.valorTotal,
      esLocal: dto.esLocal,
    });

    return {
      actual: {
        porcentaje: Number((simulacion.resultadoActual.porcentaje * 100).toFixed(1)),
        estado: simulacion.resultadoActual.estado,
      },
      simulado: {
        porcentaje: Number((simulacion.resultadoSimulado.porcentaje * 100).toFixed(1)),
        estado: simulacion.resultadoSimulado.estado,
      },
      impacto: Number((simulacion.impactoDelta * 100).toFixed(1)),
    };
  }
}
