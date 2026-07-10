import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CrearActaDto, ActualizarActaDto } from './dto';

@Injectable()
export class ActasReciboService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearActaDto, userId: string, tenantId: string) {
    const orden = await this.prisma.ordenCompra.findFirst({
      where: { id: dto.ordenId, tenantId },
      include: { productor: { select: { id: true } } },
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');

    return this.prisma.actaRecibo.create({
      data: {
        tenantId,
        ordenId: dto.ordenId,
        interventorId: userId,
        productorId: orden.productor.id,
        fechaVisita: new Date(dto.fechaVisita),
        geolocalizacion: dto.geolocalizacion || {},
        itemsVerificados: dto.itemsVerificados || [],
        firmaInterventorUrl: dto.firmaInterventorUrl,
        firmaProductorUrl: dto.firmaProductorUrl,
        actaPdfUrl: dto.actaPdfUrl,
      },
      include: { orden: { select: { numero: true } }, productor: { select: { razonSocial: true } } },
    });
  }

  async listar(tenantId: string) {
    return this.prisma.actaRecibo.findMany({
      where: { tenantId },
      include: {
        orden: { select: { numero: true, valorTotal: true } },
        productor: { select: { razonSocial: true } },
        interventor: { select: { nombreCompleto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtener(id: string, tenantId: string) {
    const acta = await this.prisma.actaRecibo.findFirst({
      where: { id, tenantId },
      include: {
        orden: {
          include: {
            productor: { select: { razonSocial: true, numeroDocumento: true } },
            items: true,
          },
        },
        interventor: { select: { nombreCompleto: true } },
        productor: { select: { razonSocial: true, numeroDocumento: true } },
      },
    });
    if (!acta) throw new NotFoundException('Acta no encontrada');
    return acta;
  }

  async actualizar(id: string, dto: ActualizarActaDto, tenantId: string) {
    const acta = await this.prisma.actaRecibo.findFirst({
      where: { id, tenantId },
    });
    if (!acta) throw new NotFoundException('Acta no encontrada');

    return this.prisma.actaRecibo.update({
      where: { id },
      data: {
        ...dto,
        itemsVerificados: dto.itemsVerificados || undefined,
      },
    });
  }
}
