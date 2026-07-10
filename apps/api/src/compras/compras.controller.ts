import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ComprasService } from './compras.service';
import { CrearOrdenDto, SimularOrdenDto, CrearContratoDto, ActualizarContratoDto } from './dto';

@Controller('compras')
export class ComprasController {
  constructor(private readonly compras: ComprasService) {}

  @Get('contratos')
  @UseGuards(AuthGuard('jwt'))
  async listarContratos(@Req() req: any) {
    return this.compras.listarContratos(req.user.tenantId);
  }

  @Post('contratos')
  @UseGuards(AuthGuard('jwt'))
  async crearContrato(@Body() dto: CrearContratoDto, @Req() req: any) {
    return this.compras.crearContrato(dto, req.user.id, req.user.tenantId);
  }

  @Get('contratos/:id')
  @UseGuards(AuthGuard('jwt'))
  async obtenerContrato(@Param('id') id: string, @Req() req: any) {
    return this.compras.obtenerContrato(id, req.user.tenantId);
  }

  @Patch('contratos/:id')
  @UseGuards(AuthGuard('jwt'))
  async actualizarContrato(
    @Param('id') id: string,
    @Body() dto: ActualizarContratoDto,
    @Req() req: any,
  ) {
    return this.compras.actualizarContrato(id, dto, req.user.tenantId);
  }

  @Post('ordenes')
  @UseGuards(AuthGuard('jwt'))
  async crearOrden(@Body() dto: CrearOrdenDto, @Req() req: any) {
    return this.compras.crearOrden(dto, req.user.id, req.user.tenantId);
  }

  @Get('ordenes')
  @UseGuards(AuthGuard('jwt'))
  async listarOrdenes(@Query('contratoId') contratoId: string | undefined, @Req() req: any) {
    if (contratoId) {
      return this.compras.listarOrdenes(contratoId, req.user.tenantId);
    }
    return this.compras.listarTodas(req.user.tenantId);
  }

  @Get('ordenes/:id')
  @UseGuards(AuthGuard('jwt'))
  async obtenerOrden(@Param('id') id: string, @Req() req: any) {
    return this.compras.obtenerOrden(id, req.user.tenantId);
  }

  @Get('cumplimiento/:id')
  @UseGuards(AuthGuard('jwt'))
  async obtenerCumplimiento(@Param('id') id: string, @Req() req: any) {
    return this.compras.obtenerCumplimiento(id, req.user.tenantId);
  }

  @Post(':id/simular')
  @UseGuards(AuthGuard('jwt'))
  async simular(@Param('id') id: string, @Body() dto: SimularOrdenDto, @Req() req: any) {
    return this.compras.simularEscenario({ ...dto, contratoId: id }, req.user.tenantId);
  }
}
