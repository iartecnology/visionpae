import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CrearRuedaDto, ActualizarRuedaDto, CrearDemandaDto, CrearMatchDto } from './dto';

@Injectable()
export class RuedasService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearRuedaDto, tenantId: string, userId: string) {
    return this.prisma.ruedaNegocio.create({
      data: {
        nombre: dto.nombre,
        tenantId,
        createdBy: userId,
        fecha: new Date(dto.fecha),
        lugar: dto.lugar,
        descripcion: dto.descripcion,
        tipo: (dto.tipo ?? 'presencial') as any,
      },
    });
  }

  async listar(tenantId: string) {
    return this.prisma.ruedaNegocio.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { demandas: true, _count: { select: { matches: true } } },
    });
  }

  async obtener(id: string, tenantId: string) {
    const rueda = await this.prisma.ruedaNegocio.findFirst({
      where: { id, tenantId },
      include: {
        demandas: { include: { matches: { include: { productor: true } } } },
        matches: { include: { demanda: true, productor: true } },
      },
    });
    if (!rueda) throw new NotFoundException('Rueda no encontrada');
    return rueda;
  }

  async actualizar(id: string, dto: ActualizarRuedaDto, tenantId: string) {
    await this.obtener(id, tenantId);
    const data: any = { ...dto };
    if (dto.fecha) data.fecha = new Date(dto.fecha);
    return this.prisma.ruedaNegocio.update({ where: { id }, data });
  }

  async listarDemandas(ruedaId: string, tenantId: string) {
    await this.obtener(ruedaId, tenantId);
    return this.prisma.demandaRueda.findMany({
      where: { ruedaId },
      include: { matches: { include: { productor: true } } },
    });
  }

  async agregarDemanda(ruedaId: string, dto: CrearDemandaDto, tenantId: string) {
    await this.obtener(ruedaId, tenantId);
    return this.prisma.demandaRueda.create({
      data: {
        ruedaId,
        entidadNombre: dto.entidadNombre,
        entidadMunicipio: dto.entidadMunicipio,
        productosRequeridos: dto.productosRequeridos as any,
      },
    });
  }

  async crearMatch(ruedaId: string, dto: CrearMatchDto, tenantId: string) {
    await this.obtener(ruedaId, tenantId);
    return this.prisma.matchOfertaDemanda.create({
      data: {
        ruedaId,
        demandaId: dto.demandaId,
        productorId: dto.productorId,
        productoMatch: dto.productoMatch,
        volumenOfrecido: dto.volumenOfrecido,
        precioOfertado: dto.precioOfertado,
        distanciaKm: dto.distanciaKm,
      },
      include: { demanda: true, productor: true },
    });
  }

  async actualizarMatch(id: string, estado: string, tenantId: string) {
    const match = await this.prisma.matchOfertaDemanda.findFirst({
      where: { id },
      include: { rueda: true },
    });
    if (!match || match.rueda.tenantId !== tenantId) {
      throw new NotFoundException('Match no encontrado');
    }
    return this.prisma.matchOfertaDemanda.update({
      where: { id },
      data: { estado: estado as any },
    });
  }
}
