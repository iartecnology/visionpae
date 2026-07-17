import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';

@Controller('ubicacion')
@UseGuards(AuthGuard('jwt'))
export class UbicacionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('paises')
  async paises() {
    return this.prisma.pais.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  @Get('departamentos')
  async departamentos(@Query('pais') pais?: string) {
    return this.prisma.departamento.findMany({
      where: pais ? { paisCodigo: pais } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  @Get('departamentos/:codigo/municipios')
  async municipios(@Param('codigo') codigo: string) {
    return this.prisma.municipio.findMany({
      where: { codigoDepartamento: codigo },
      orderBy: { nombre: 'asc' },
    });
  }

  @Get('municipios/:codigo/veredas')
  async veredas(@Param('codigo') codigo: string) {
    return this.prisma.vereda.findMany({
      where: { codigoMunicipio: codigo },
      orderBy: { nombre: 'asc' },
    });
  }
}
