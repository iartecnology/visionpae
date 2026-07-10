import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncidenciasService } from './incidencias.service';
import { CrearIncidenciaDto, ResolverIncidenciaDto } from './dto';
import { TenantGuard } from '../auth/tenant.guard';
import { Tenant } from '../auth/tenant.decorator';
import { User } from '../auth/user.decorator';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  @Post()
  crear(@Body() dto: CrearIncidenciaDto, @User('id') userId: string, @Tenant() tenantId: string) {
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

  @Patch(':id/resolver')
  resolver(@Param('id') id: string, @Body() dto: ResolverIncidenciaDto, @User('id') userId: string, @Tenant() tenantId: string) {
    return this.service.resolver(id, dto, userId, tenantId);
  }
}
