import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { RuplService } from './rupl.service';
import { CrearProductorDto, ActualizarProductorDto, BuscarProductorDto, CrearProductoOfrecidoDto, CrearDocumentoDto, ActualizarDocumentoDto } from './dto';

@Controller('rupl/productores')
export class RuplController {
  constructor(private readonly rupl: RuplService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async crear(@Body() dto: CrearProductorDto, @Req() req: any) {
    return this.rupl.crear(dto, req.user.tenantId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async listar(@Query() filtros: BuscarProductorDto, @Req() req: any) {
    return this.rupl.listar(filtros, req.user.tenantId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async obtener(@Param('id') id: string, @Req() req: any) {
    return this.rupl.obtener(id, req.user.tenantId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarProductorDto,
    @Req() req: any,
  ) {
    return this.rupl.actualizar(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async desactivar(@Param('id') id: string, @Req() req: any) {
    return this.rupl.desactivar(id, req.user.tenantId);
  }

  // ---- Productos ----

  @Post(':id/productos')
  @UseGuards(AuthGuard('jwt'))
  async agregarProducto(
    @Param('id') id: string,
    @Body() dto: CrearProductoOfrecidoDto,
    @Req() req: any,
  ) {
    return this.rupl.agregarProducto(id, dto, req.user.tenantId);
  }

  @Get(':id/productos')
  @UseGuards(AuthGuard('jwt'))
  async listarProductos(@Param('id') id: string, @Req() req: any) {
    return this.rupl.listarProductos(id, req.user.tenantId);
  }

  @Patch(':id/productos/:prodId')
  @UseGuards(AuthGuard('jwt'))
  async actualizarProducto(
    @Param('id') id: string,
    @Param('prodId') prodId: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    return this.rupl.actualizarProducto(prodId, dto, req.user.tenantId);
  }

  @Delete(':id/productos/:prodId')
  @UseGuards(AuthGuard('jwt'))
  async eliminarProducto(
    @Param('id') id: string,
    @Param('prodId') prodId: string,
    @Req() req: any,
  ) {
    return this.rupl.eliminarProducto(prodId, req.user.tenantId);
  }

  // ---- Calificación ----

  @Put(':id/calificacion')
  @UseGuards(AuthGuard('jwt'))
  async actualizarCalificacion(
    @Param('id') id: string,
    @Body('calificacion') calificacion: number,
    @Req() req: any,
  ) {
    return this.rupl.actualizarCalificacion(id, calificacion, req.user.tenantId);
  }

  @Get(':id/calificacion')
  @UseGuards(AuthGuard('jwt'))
  async obtenerCalificacion(@Param('id') id: string, @Req() req: any) {
    return this.rupl.obtenerCalificacion(id, req.user.tenantId);
  }

  // ---- Documentos ----

  @Post(':id/documentos')
  @UseGuards(AuthGuard('jwt'))
  async agregarDocumento(
    @Param('id') id: string,
    @Body() dto: CrearDocumentoDto,
    @Req() req: any,
  ) {
    return this.rupl.agregarDocumento(id, dto, req.user.tenantId, req.user.id);
  }

  @Get(':id/documentos')
  @UseGuards(AuthGuard('jwt'))
  async listarDocumentos(@Param('id') id: string, @Req() req: any) {
    return this.rupl.listarDocumentos(id, req.user.tenantId);
  }

  @Patch(':id/documentos/:docId')
  @UseGuards(AuthGuard('jwt'))
  async actualizarDocumento(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Body() dto: ActualizarDocumentoDto,
    @Req() req: any,
  ) {
    return this.rupl.actualizarDocumento(id, docId, dto, req.user.tenantId);
  }

  @Delete(':id/documentos/:docId')
  @UseGuards(AuthGuard('jwt'))
  async eliminarDocumento(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Req() req: any,
  ) {
    return this.rupl.eliminarDocumento(id, docId, req.user.tenantId);
  }

  @Post(':id/documentos/subir')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(__dirname, '..', '..', 'uploads'),
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async subirArchivo(
    @Param('id') _id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return { url: `/uploads/${file.filename}`, originalName: file.originalname, mimeType: file.mimetype, size: file.size };
  }

  // ---- Catálogo global de productos ----

  @Get('/productos/buscar')
  @UseGuards(AuthGuard('jwt'))
  async buscarProductos(
    @Query('q') q?: string,
    @Query('categoria') categoria?: string,
    @Query('codigoMunicipio') codigoMunicipio?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    return this.rupl.buscarProductos({
      q, categoria, codigoMunicipio, page, limit,
      tenantId: req.user.tenantId,
    });
  }
}
