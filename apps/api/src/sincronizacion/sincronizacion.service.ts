import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SincronizacionService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(data: {
    tenantId: string;
    userId: string;
    dispositivoId: string;
    tipoDispositivo: string;
    modelosSincronizados?: string[];
  }) {
    return this.prisma.syncBatch.upsert({
      where: { tenantId_dispositivoId: { tenantId: data.tenantId, dispositivoId: data.dispositivoId } },
      create: {
        tenantId: data.tenantId,
        userId: data.userId,
        dispositivoId: data.dispositivoId,
        tipoDispositivo: data.tipoDispositivo as any,
        modelosSincronizados: data.modelosSincronizados || [],
        ultimoSyncPush: new Date(),
      },
      update: {
        userId: data.userId,
        tipoDispositivo: data.tipoDispositivo as any,
        modelosSincronizados: data.modelosSincronizados || [],
        ultimoSyncPush: new Date(),
        estado: 'synced',
        cambiosPendientes: 0,
      },
    });
  }

  async listar(tenantId: string) {
    return this.prisma.syncBatch.findMany({
      where: { tenantId },
      include: { user: { select: { nombreCompleto: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async obtener(id: string, tenantId: string) {
    const batch = await this.prisma.syncBatch.findFirst({
      where: { id, tenantId },
      include: { user: { select: { nombreCompleto: true, email: true } } },
    });
    if (!batch) throw new NotFoundException('Sincronización no encontrada');
    return batch;
  }

  async reportarConflictos(id: string, tenantId: string) {
    return this.prisma.syncBatch.updateMany({
      where: { id, tenantId },
      data: { estado: 'conflict', cambiosPendientes: { increment: 1 } },
    });
  }
}
