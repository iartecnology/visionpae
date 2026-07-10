import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SincronizacionService } from './sincronizacion.service';
import { TenantGuard } from '../auth/tenant.guard';
import { Tenant } from '../auth/tenant.decorator';
import { User } from '../auth/user.decorator';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('sincronizacion')
export class SincronizacionController {
  constructor(private readonly service: SincronizacionService) {}

  @Post('registrar')
  async registrar(
    @Body() body: { dispositivoId: string; tipoDispositivo: string; modelosSincronizados?: string[] },
    @User('id') userId: string,
    @Tenant() tenantId: string,
  ) {
    return this.service.registrar({ ...body, userId, tenantId });
  }

  @Get()
  async listar(@Tenant() tenantId: string) {
    return this.service.listar(tenantId);
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.service.obtener(id, tenantId);
  }

  @Post(':id/conflicto')
  async reportarConflicto(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.service.reportarConflictos(id, tenantId);
  }
}
