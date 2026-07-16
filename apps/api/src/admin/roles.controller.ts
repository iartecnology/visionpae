import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma.service';

@Controller('admin/roles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('super_admin')
export class RolesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async listar() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
          orderBy: { permission: { recurso: 'asc' } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Get(':id')
  async obtener(@Param('id') id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
          orderBy: { permission: { recurso: 'asc' } },
        },
      },
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  @Post()
  async crear(@Body() body: { nombre: string; codigo: string; descripcion?: string; permissionIds?: string[] }) {
    const existing = await this.prisma.role.findUnique({ where: { codigo: body.codigo } });
    if (existing) throw new BadRequestException('Ya existe un rol con ese código');

    return this.prisma.role.create({
      data: {
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
        permissions: body.permissionIds?.length
          ? { create: body.permissionIds.map((pid) => ({ permissionId: pid })) }
          : undefined,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() body: { nombre?: string; descripcion?: string; permissionIds?: string[] },
  ) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    if (role.esSistema && body.nombre && body.nombre !== role.nombre) {
      throw new BadRequestException('No se puede renombrar un rol del sistema');
    }

    if (body.permissionIds) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (body.permissionIds.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: body.permissionIds.map((pid) => ({ roleId: id, permissionId: pid })),
        });
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...(body.nombre && { nombre: body.nombre }),
        ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    if (role.esSistema) throw new BadRequestException('No se puede eliminar un rol del sistema');

    const userCount = await this.prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) throw new BadRequestException(`El rol tiene ${userCount} usuario(s) asignado(s)`);

    await this.prisma.role.delete({ where: { id } });
    return { deleted: true };
  }
}
