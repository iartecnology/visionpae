import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma.service';
import { CrearTenantDto, ActualizarTenantDto } from './dto';

@Controller('admin/tenants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('super_admin')
export class TenantsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async crear(@Body() dto: CrearTenantDto) {
    return this.prisma.tenant.create({
      data: {
        nombre: dto.nombre,
        slug: dto.slug,
        codigoDane: dto.codigoDane,
        departamento: dto.departamento,
        tipo: dto.tipo as any,
        config: (dto.config ?? {}) as any,
      },
    });
  }

  @Get()
  async listar(@Query('activo') activo?: string) {
    const where = activo !== undefined ? { activo: activo === 'true' } : {};
    return this.prisma.tenant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async obtener(@Param('id') id: string) {
    return this.prisma.tenant.findUniqueOrThrow({ where: { id } });
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarTenantDto) {
    return this.prisma.tenant.update({ where: { id }, data: dto as any });
  }

  @Patch(':id/config')
  async actualizarConfig(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Entidad no encontrada');

    const currentConfig = (tenant.config as Record<string, unknown>) ?? {};
    const newConfig = { ...currentConfig, ...body };

    return this.prisma.tenant.update({
      where: { id },
      data: { config: newConfig as any },
      select: { id: true, nombre: true, config: true },
    });
  }

  @Delete(':id')
  async desactivar(@Param('id') id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { activo: false },
    });
  }
}
