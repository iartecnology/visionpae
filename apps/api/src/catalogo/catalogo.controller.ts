import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CatalogoService } from './catalogo.service';

@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  // ---- Productos Base ----

  @Get('productos')
  @UseGuards(AuthGuard('jwt'))
  async listarProductosBase(
    @Query('q') q?: string,
    @Query('categoria') categoria?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    return this.catalogo.listarProductosBase({
      q, categoria,
      page: page ?? 1,
      limit: limit ?? 50,
      tenantId: req.user?.tenantId,
    });
  }

  @Get('productos/:id')
  @UseGuards(AuthGuard('jwt'))
  async obtenerProductoBase(@Param('id') id: string) {
    return this.catalogo.obtenerProductoBase(id);
  }

  @Post('productos')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('super_admin', 'admin_entidad')
  async crearProductoBase(@Body() dto: any, @Req() req: any) {
    return this.catalogo.crearProductoBase({
      ...dto,
      createdBy: req.user.id,
    });
  }

  @Patch('productos/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('super_admin', 'admin_entidad')
  async actualizarProductoBase(@Param('id') id: string, @Body() dto: any) {
    return this.catalogo.actualizarProductoBase(id, dto);
  }

  @Delete('productos/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('super_admin', 'admin_entidad')
  async eliminarProductoBase(@Param('id') id: string) {
    return this.catalogo.eliminarProductoBase(id);
  }

  // ---- UNSPSC ----

  @Get('unspsc')
  @UseGuards(AuthGuard('jwt'))
  async listarUnspsc(
    @Query('padreId') padreId?: string,
    @Query('q') q?: string,
  ) {
    if (q) return this.catalogo.buscarUnspsc(q);
    return this.catalogo.listarUnspsc(padreId);
  }

  // ---- SIPSA ----

  @Get('sipsa')
  @UseGuards(AuthGuard('jwt'))
  async listarSipsa(@Query('categoria') categoria?: string) {
    return this.catalogo.listarSipsa(categoria);
  }
}
