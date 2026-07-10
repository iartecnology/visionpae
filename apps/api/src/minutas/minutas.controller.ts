import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MinutasService } from './minutas.service';
import { CrearRecetaDto, ActualizarRecetaDto, CrearPlanSemanalDto, AgregarItemPlanDto } from './dto';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class MinutasController {
  constructor(private readonly minutas: MinutasService) {}

  @Post('recetas')
  async crearReceta(@Body() dto: CrearRecetaDto, @Req() req: any) {
    return this.minutas.crearReceta(dto, req.user.tenantId, req.user.id);
  }

  @Get('recetas')
  async listarRecetas(@Req() req: any) {
    return this.minutas.listarRecetas(req.user.tenantId);
  }

  @Get('recetas/:id')
  async obtenerReceta(@Param('id') id: string, @Req() req: any) {
    return this.minutas.obtenerReceta(id, req.user.tenantId);
  }

  @Patch('recetas/:id')
  async actualizarReceta(@Param('id') id: string, @Body() dto: ActualizarRecetaDto, @Req() req: any) {
    return this.minutas.actualizarReceta(id, dto, req.user.tenantId);
  }

  @Delete('recetas/:id')
  async eliminarReceta(@Param('id') id: string, @Req() req: any) {
    return this.minutas.eliminarReceta(id, req.user.tenantId);
  }

  @Post('planes-semanales')
  async crearPlan(@Body() dto: CrearPlanSemanalDto, @Req() req: any) {
    return this.minutas.crearPlan(dto, req.user.tenantId, req.user.id);
  }

  @Get('planes-semanales')
  async listarPlanes(@Req() req: any) {
    return this.minutas.listarPlanes(req.user.tenantId);
  }

  @Get('planes-semanales/:id')
  async obtenerPlan(@Param('id') id: string, @Req() req: any) {
    return this.minutas.obtenerPlan(id, req.user.tenantId);
  }

  @Post('planes-semanales/:id/items')
  async agregarItem(@Param('id') id: string, @Body() dto: AgregarItemPlanDto, @Req() req: any) {
    return this.minutas.agregarItemPlan(id, dto, req.user.tenantId);
  }

  @Delete('planes-semanales/items/:itemId')
  async eliminarItem(@Param('itemId') itemId: string, @Req() req: any) {
    return this.minutas.eliminarItemPlan(itemId, req.user.tenantId);
  }
}
