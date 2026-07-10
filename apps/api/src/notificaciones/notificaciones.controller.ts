import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificacionesService } from './notificaciones.service';
import { TenantGuard } from '../auth/tenant.guard';
import { Tenant } from '../auth/tenant.decorator';
import { User } from '../auth/user.decorator';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly service: NotificacionesService) {}

  @Get()
  listar(@User('id') userId: string, @Tenant() tenantId: string) {
    return this.service.listar(userId, tenantId);
  }

  @Get('no-leidas')
  noLeidas(@User('id') userId: string, @Tenant() tenantId: string) {
    return this.service.noLeidas(userId, tenantId);
  }

  @Patch(':id/leer')
  marcarLeida(@Param('id') id: string, @User('id') userId: string, @Tenant() tenantId: string) {
    return this.service.marcarLeida(id, userId, tenantId);
  }

  @Post('leer-todas')
  marcarTodasLeidas(@User('id') userId: string, @Tenant() tenantId: string) {
    return this.service.marcarTodasLeidas(userId, tenantId);
  }
}
