import {
  Controller, Get, Post, Patch,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RuedasService } from './ruedas.service';
import { CrearRuedaDto, ActualizarRuedaDto, CrearDemandaDto, CrearMatchDto } from './dto';

@Controller('ruedas')
@UseGuards(AuthGuard('jwt'))
export class RuedasController {
  constructor(private readonly ruedas: RuedasService) {}

  @Post()
  async crear(@Body() dto: CrearRuedaDto, @Req() req: any) {
    return this.ruedas.crear(dto, req.user.tenantId, req.user.id);
  }

  @Get()
  async listar(@Req() req: any) {
    return this.ruedas.listar(req.user.tenantId);
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Req() req: any) {
    return this.ruedas.obtener(id, req.user.tenantId);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarRuedaDto, @Req() req: any) {
    return this.ruedas.actualizar(id, dto, req.user.tenantId);
  }

  @Get(':id/demandas')
  async listarDemandas(@Param('id') id: string, @Req() req: any) {
    return this.ruedas.listarDemandas(id, req.user.tenantId);
  }

  @Post(':id/demandas')
  async agregarDemanda(@Param('id') id: string, @Body() dto: CrearDemandaDto, @Req() req: any) {
    return this.ruedas.agregarDemanda(id, dto, req.user.tenantId);
  }

  @Post(':id/matches')
  async crearMatch(@Param('id') id: string, @Body() dto: CrearMatchDto, @Req() req: any) {
    return this.ruedas.crearMatch(id, dto, req.user.tenantId);
  }

  @Patch('matches/:id/estado')
  async actualizarMatch(@Param('id') id: string, @Body() body: { estado: string }, @Req() req: any) {
    return this.ruedas.actualizarMatch(id, body.estado, req.user.tenantId);
  }
}
