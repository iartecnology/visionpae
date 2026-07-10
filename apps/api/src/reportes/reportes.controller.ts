import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';

@Controller('reportes')
@UseGuards(AuthGuard('jwt'))
export class ReportesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('resumen')
  async resumen(@Req() req: any) {
    const tenantId = req.user.tenantId;
    const [totalProductores, totalOrdenes, totalRecetas, totalRuedas, ventasTotales] = await Promise.all([
      this.prisma.productor.count({ where: { tenantId, estado: 'activo' } }),
      this.prisma.ordenCompra.count({ where: { tenantId } }),
      this.prisma.receta.count({ where: { tenantId, activo: true } }),
      this.prisma.ruedaNegocio.count({ where: { tenantId } }),
      this.prisma.ordenCompra.aggregate({ where: { tenantId }, _sum: { valorTotal: true } }),
    ]);
    return {
      totalProductores,
      totalOrdenes,
      totalRecetas,
      totalRuedas,
      ventasTotales: Number(ventasTotales._sum.valorTotal || 0),
    };
  }

  @Get('cumplimiento')
  async cumplimiento(@Req() req: any) {
    const tenantId = req.user.tenantId;
    const contratos = await this.prisma.contratoMarco.findMany({
      where: { tenantId },
      select: {
        id: true,
        numero: true,
        valorTotal: true,
        presupuestoComprasLocales: true,
        ordenes: {
          where: { estado: 'entregada' },
          select: { valorTotal: true, esLocal: true },
        },
      },
    });
    return contratos.map((c) => {
      const gastoTotal = Number(c.ordenes.reduce((s, o) => s + Number(o.valorTotal), 0));
      const gastoLocal = Number(c.ordenes.filter((o) => o.esLocal).reduce((s, o) => s + Number(o.valorTotal), 0));
      const presupuesto = Number(c.presupuestoComprasLocales);
      return {
        contrato: c.numero,
        presupuestoLocal: presupuesto,
        gastoLocal,
        gastoTotal,
        porcentajeCumplimiento: presupuesto > 0 ? Math.round((gastoLocal / presupuesto) * 100) : 0,
      };
    });
  }

  @Get('productores')
  async productores(@Req() req: any, @Query('municipio') municipio?: string) {
    const tenantId = req.user.tenantId;
    const where: any = { tenantId };
    if (municipio) where.codigoMunicipio = municipio;
    const productores = await this.prisma.productor.findMany({
      where,
      select: {
        tipoPersona: true,
        estrato: true,
        estado: true,
        codigoMunicipio: true,
        _count: { select: { productos: true } },
      },
    });
    return {
      total: productores.length,
      porTipo: this.agrupar(productores, 'tipoPersona'),
      porEstado: this.agrupar(productores, 'estado'),
      porEstrato: this.agrupar(productores, 'estrato'),
    };
  }

  @Get('compras-temporal')
  async comprasTemporal(@Req() req: any, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    const tenantId = req.user.tenantId;
    const where: any = { tenantId, estado: 'entregada' };
    if (desde) where.fechaEmision = { ...where.fechaEmision, gte: new Date(desde) };
    if (hasta) where.fechaEmision = { ...where.fechaEmision, lte: new Date(hasta) };

    const ordenes = await this.prisma.ordenCompra.findMany({
      where,
      select: { fechaEmision: true, valorTotal: true, esLocal: true },
    });

    const meses: Record<string, { mes: string; local: number; externo: number; total: number }> = {};
    for (const o of ordenes) {
      const key = o.fechaEmision.toISOString().slice(0, 7);
      if (!meses[key]) meses[key] = { mes: key, local: 0, externo: 0, total: 0 };
      meses[key].total += Number(o.valorTotal);
      if (o.esLocal) meses[key].local += Number(o.valorTotal);
      else meses[key].externo += Number(o.valorTotal);
    }
    return Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes));
  }

  @Get('categorias')
  async categorias(@Req() req: any) {
    const tenantId = req.user.tenantId;
    const productos = await this.prisma.productoOfrecido.findMany({
      where: { tenantId, activo: true },
      select: { categoria: true, _count: { select: { itemsOrden: true } } },
    });
    const categorias: Record<string, { categoria: string; total: number; usos: number }> = {};
    for (const p of productos) {
      const cat = p.categoria;
      if (!categorias[cat]) categorias[cat] = { categoria: cat, total: 0, usos: 0 };
      categorias[cat].total++;
      categorias[cat].usos += p._count.itemsOrden;
    }
    return Object.values(categorias);
  }

  private agrupar(items: any[], campo: string) {
    const map: Record<string, number> = {};
    for (const item of items) {
      const val = item[campo] || 'sin_dato';
      map[val] = (map[val] || 0) + 1;
    }
    return Object.entries(map).map(([clave, count]) => ({ clave, count }));
  }
}
