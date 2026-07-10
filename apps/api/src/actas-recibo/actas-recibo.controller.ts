import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActasReciboService } from './actas-recibo.service';
import { CrearActaDto, ActualizarActaDto } from './dto';
import { TenantGuard } from '../auth/tenant.guard';
import { Tenant } from '../auth/tenant.decorator';
import { User } from '../auth/user.decorator';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('actas-recibo')
export class ActasReciboController {
  constructor(private readonly service: ActasReciboService) {}

  @Post()
  crear(@Body() dto: CrearActaDto, @User('id') userId: string, @Tenant() tenantId: string) {
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

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarActaDto, @Tenant() tenantId: string) {
    return this.service.actualizar(id, dto, tenantId);
  }
}
