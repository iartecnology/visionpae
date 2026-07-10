import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CrearCertificacionDto } from './dto';

@Injectable()
export class CertificacionService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearCertificacionDto, userId: string, tenantId: string) {
    const contrato = await this.prisma.contratoMarco.findFirst({
      where: { id: dto.contratoId, tenantId },
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    return this.prisma.certificacionInsuficiencia.create({
      data: {
        tenantId,
        contratoId: dto.contratoId,
        numeroExpediente: `CE-${Date.now()}`,
        productoCategoria: dto.productoCategoria as any,
        volumenRequeridoMensual: dto.volumenRequeridoMensual,
        periodoInicio: new Date(dto.periodoInicio),
        periodoFin: new Date(dto.periodoFin),
        estado: 'en_elaboracion',
        createdBy: userId,
        referenciados: dto.productoresNoLocales?.length
          ? { create: dto.productoresNoLocales.map((p) => ({ ...p })) }
          : undefined,
      },
      include: { referenciados: true, contrato: true },
    });
  }

  async listar(tenantId: string) {
    return this.prisma.certificacionInsuficiencia.findMany({
      where: { tenantId },
      include: {
        contrato: { select: { numero: true } },
        _count: { select: { evidencias: true, referenciados: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtener(id: string, tenantId: string) {
    const cert = await this.prisma.certificacionInsuficiencia.findFirst({
      where: { id, tenantId },
      include: {
        contrato: true,
        evidencias: true,
        referenciados: true,
      },
    });
    if (!cert) throw new NotFoundException('Certificación no encontrada');
    return cert;
  }

  async cambiarEstado(id: string, estado: string, tenantId: string) {
    const cert = await this.prisma.certificacionInsuficiencia.findFirst({
      where: { id, tenantId },
    });
    if (!cert) throw new NotFoundException('Certificación no encontrada');

    return this.prisma.certificacionInsuficiencia.update({
      where: { id },
      data: { estado: estado as any },
    });
  }
}
