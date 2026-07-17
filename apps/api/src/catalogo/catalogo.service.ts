import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- ProductoBase CRUD ----

  async listarProductosBase(filtros: {
    q?: string;
    categoria?: string;
    tenantId?: string;
    page: number;
    limit: number;
  }) {
    const where: any = { activo: true };
    if (filtros.categoria) where.categoria = filtros.categoria;
    if (filtros.q) where.nombre = { contains: filtros.q, mode: 'insensitive' };
    if (filtros.tenantId) {
      where.OR = [
        { tenantId: filtros.tenantId },
        { tenantId: null },
      ];
    }

    const total = await this.prisma.productoBase.count({ where });
    const items = await this.prisma.productoBase.findMany({
      where,
      orderBy: { nombre: 'asc' },
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit,
    });

    return { data: items, meta: { page: filtros.page, limit: filtros.limit, total } };
  }

  async obtenerProductoBase(id: string) {
    const item = await this.prisma.productoBase.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Producto base no encontrado');
    return item;
  }

  async crearProductoBase(data: any) {
    return this.prisma.productoBase.create({ data });
  }

  async actualizarProductoBase(id: string, data: any) {
    const item = await this.prisma.productoBase.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Producto base no encontrado');
    return this.prisma.productoBase.update({ where: { id }, data });
  }

  async eliminarProductoBase(id: string) {
    const item = await this.prisma.productoBase.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Producto base no encontrado');
    return this.prisma.productoBase.update({ where: { id }, data: { activo: false } });
  }

  // ---- UNSPSC ----

  async listarUnspsc(padreId?: string) {
    const where: any = {};
    if (padreId !== undefined) {
      where.padreId = padreId || null;
    }
    return this.prisma.unidadUnspsc.findMany({
      where,
      orderBy: { codigo: 'asc' },
    });
  }

  async buscarUnspsc(q: string) {
    return this.prisma.unidadUnspsc.findMany({
      where: {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { codigo: { contains: q } },
        ],
      },
      orderBy: { codigo: 'asc' },
      take: 50,
    });
  }

  // ---- SIPSA ----

  async listarSipsa(categoria?: string) {
    const where: any = {};
    if (categoria) where.categoria = categoria;
    return this.prisma.unidadSipsa.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }
}
