import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CrearIncidenciaDto, ResolverIncidenciaDto } from './dto';

@Injectable()
export class IncidenciasService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearIncidenciaDto, userId: string, tenantId: string) {
    const orden = await this.prisma.ordenCompra.findFirst({
      where: { id: dto.ordenId, tenantId },
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');

    return this.prisma.incidenciaCampo.create({
      data: {
        tenantId,
        ordenId: dto.ordenId,
        reportadoPor: userId,
        tipo: dto.tipo as any,
        descripcion: dto.descripcion,
        fotoUrls: dto.fotoUrls || [],
        latitud: dto.latitud,
        longitud: dto.longitud,
      },
      include: { orden: true },
    });
  }

  async listar(tenantId: string) {
    return this.prisma.incidenciaCampo.findMany({
      where: { tenantId },
      include: {
        orden: { select: { numero: true, valorTotal: true } },
        reportado: { select: { nombreCompleto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtener(id: string, tenantId: string) {
    const inc = await this.prisma.incidenciaCampo.findFirst({
      where: { id, tenantId },
      include: {
        orden: { include: { productor: { select: { razonSocial: true } } } },
        reportado: { select: { nombreCompleto: true } },
        resuelto: { select: { nombreCompleto: true } },
      },
    });
    if (!inc) throw new NotFoundException('Incidencia no encontrada');
    return inc;
  }

  async resolver(id: string, dto: ResolverIncidenciaDto, userId: string, tenantId: string) {
    const inc = await this.prisma.incidenciaCampo.findFirst({
      where: { id, tenantId },
    });
    if (!inc) throw new NotFoundException('Incidencia no encontrada');

    const data: any = { estado: dto.estado as any };
    if (dto.estado === 'resuelta' || dto.estado === 'cerrada') {
      data.resueltoPor = userId;
      data.fechaResolucion = new Date();
      data.resolucion = dto.resolucion;
    }

    return this.prisma.incidenciaCampo.update({
      where: { id },
      data,
      include: { orden: { select: { numero: true } } },
    });
  }
}
