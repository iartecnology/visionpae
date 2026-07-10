import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req, ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma.service';
import { CrearUsuarioDto, ActualizarUsuarioDto } from './dto';

@Controller('admin/usuarios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsuariosController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @Roles('super_admin', 'admin_entidad')
  async crear(@Body() dto: CrearUsuarioDto & { tenantId?: string }, @Req() req: any) {
    if (dto.rol === 'super_admin' && !req.user.roles.includes('super_admin')) {
      throw new ForbiddenException('Solo un super_admin puede crear otro super_admin');
    }

    const tenantId = req.user.roles.includes('super_admin')
      ? dto.tenantId || req.user.tenantId
      : req.user.tenantId;

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nombreCompleto: dto.nombreCompleto,
        tipoDocumento: dto.tipoDocumento as any,
        numeroDocumento: dto.numeroDocumento,
        rol: dto.rol as any,
        telefono: dto.telefono,
        tenantId,
      },
    });
  }

  @Get()
  @Roles('super_admin', 'admin_entidad')
  async listar(@Req() req: any, @Query('tenantId') tenantId?: string) {
    const where: any = {};
    if (req.user.roles.includes('super_admin')) {
      if (tenantId) where.tenantId = tenantId;
    } else {
      where.tenantId = req.user.tenantId;
    }
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        rol: true,
        activo: true,
        tenantId: true,
        ultimoAcceso: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  @Roles('super_admin', 'admin_entidad')
  async obtener(@Param('id') id: string, @Req() req: any) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        tipoDocumento: true,
        numeroDocumento: true,
        rol: true,
        telefono: true,
        activo: true,
        tenantId: true,
        ultimoAcceso: true,
        createdAt: true,
      },
    });
    if (!req.user.roles.includes('super_admin') && user.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }
    return user;
  }

  @Patch(':id')
  @Roles('super_admin', 'admin_entidad')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto, @Req() req: any) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    if (!req.user.roles.includes('super_admin') && user.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('No tienes permiso para modificar este usuario');
    }

    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    delete data.password;

    return this.prisma.user.update({ where: { id }, data });
  }

  @Delete(':id')
  @Roles('super_admin', 'admin_entidad')
  async desactivar(@Param('id') id: string, @Req() req: any) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    if (!req.user.roles.includes('super_admin') && user.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('No tienes permiso para desactivar este usuario');
    }
    return this.prisma.user.update({
      where: { id },
      data: { activo: false },
    });
  }
}
