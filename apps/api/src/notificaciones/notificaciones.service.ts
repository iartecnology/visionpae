import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(userId: string, tenantId: string) {
    return this.prisma.notificacion.findMany({
      where: { userId, tenantId },
      orderBy: { fecha: 'desc' },
      take: 50,
    });
  }

  async noLeidas(userId: string, tenantId: string) {
    return this.prisma.notificacion.count({
      where: { userId, tenantId, leida: false },
    });
  }

  async marcarLeida(id: string, userId: string, tenantId: string) {
    return this.prisma.notificacion.updateMany({
      where: { id, userId, tenantId },
      data: { leida: true },
    });
  }

  async marcarTodasLeidas(userId: string, tenantId: string) {
    return this.prisma.notificacion.updateMany({
      where: { userId, tenantId, leida: false },
      data: { leida: true },
    });
  }

  async crear(data: { userId: string; tenantId: string; tipo: string; titulo: string; mensaje: string; link?: string }) {
    return this.prisma.notificacion.create({ data: data as any });
  }
}
