import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CrearRecetaDto, ActualizarRecetaDto, CrearPlanSemanalDto, AgregarItemPlanDto } from './dto';

@Injectable()
export class MinutasService {
  constructor(private readonly prisma: PrismaService) {}

  async crearReceta(dto: CrearRecetaDto, tenantId: string, userId: string) {
    const { ingredientes, ...data } = dto;
    return this.prisma.receta.create({
      data: {
        ...data as any,
        tenantId,
        createdBy: userId,
        ingredientes: ingredientes?.length
          ? { create: ingredientes as any }
          : undefined,
      },
      include: { ingredientes: true },
    });
  }

  async listarRecetas(tenantId: string) {
    return this.prisma.receta.findMany({
      where: { tenantId, activo: true },
      include: { ingredientes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerReceta(id: string, tenantId: string) {
    const receta = await this.prisma.receta.findFirst({
      where: { id, tenantId },
      include: { ingredientes: true },
    });
    if (!receta) throw new NotFoundException('Receta no encontrada');
    return receta;
  }

  async actualizarReceta(id: string, dto: ActualizarRecetaDto, tenantId: string) {
    await this.obtenerReceta(id, tenantId);
    const { ingredientes, ...data } = dto;

    if (ingredientes) {
      await this.prisma.ingredienteReceta.deleteMany({ where: { recetaId: id } });
    }

    return this.prisma.receta.update({
      where: { id },
      data: {
        ...data as any,
        ingredientes: ingredientes?.length
          ? { create: ingredientes as any }
          : undefined,
      },
      include: { ingredientes: true },
    });
  }

  async eliminarReceta(id: string, tenantId: string) {
    await this.obtenerReceta(id, tenantId);
    return this.prisma.receta.update({
      where: { id },
      data: { activo: false },
    });
  }

  async crearPlan(dto: CrearPlanSemanalDto, tenantId: string, userId: string) {
    return this.prisma.planSemanal.create({
      data: {
        nombre: dto.nombre,
        tenantId,
        createdBy: userId,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        requerimientosNutricionales: dto.requerimientosNutricionales as any,
        observaciones: dto.observaciones,
      },
      include: { items: { include: { receta: true } } },
    });
  }

  async listarPlanes(tenantId: string) {
    return this.prisma.planSemanal.findMany({
      where: { tenantId },
      include: { items: { include: { receta: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPlan(id: string, tenantId: string) {
    const plan = await this.prisma.planSemanal.findFirst({
      where: { id, tenantId },
      include: { items: { include: { receta: { include: { ingredientes: true } } } } },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  async agregarItemPlan(planId: string, dto: AgregarItemPlanDto, tenantId: string) {
    await this.obtenerPlan(planId, tenantId);
    return this.prisma.planSemanalItem.create({
      data: {
        planId,
        recetaId: dto.recetaId,
        diaSemana: dto.diaSemana,
        tipoComida: dto.tipoComida as any,
        porcionesEstimadas: dto.porcionesEstimadas,
        generadoAuto: dto.generadoAuto,
      },
      include: { receta: true },
    });
  }

  async eliminarItemPlan(itemId: string, tenantId: string) {
    const item = await this.prisma.planSemanalItem.findFirst({
      where: { id: itemId },
      include: { plan: true },
    });
    if (!item || item.plan.tenantId !== tenantId) {
      throw new NotFoundException('Item no encontrado');
    }
    return this.prisma.planSemanalItem.delete({ where: { id: itemId } });
  }
}
