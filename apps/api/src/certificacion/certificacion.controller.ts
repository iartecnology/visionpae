import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CertificacionService } from './certificacion.service';
import { CrearCertificacionDto } from './dto';
import { TenantGuard } from '../auth/tenant.guard';
import { Tenant } from '../auth/tenant.decorator';
import { User } from '../auth/user.decorator';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('certificaciones')
export class CertificacionController {
  constructor(private readonly service: CertificacionService) {}

  @Post()
  crear(@Body() dto: CrearCertificacionDto, @User('id') userId: string, @Tenant() tenantId: string) {
    return this.service.crear(dto, userId, tenantId);
  }

  @Get()
  listar(@Tenant() tenantId: string) {
    return this.service.listar(tenantId);
  }

  @Get(':id')
  obtener(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.service.obtener(id, tenantId);
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: string, @Tenant() tenantId: string) {
    return this.service.cambiarEstado(id, estado, tenantId);
  }
}
