import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';

@Controller('ubicacion')
@UseGuards(AuthGuard('jwt'))
export class UbicacionController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('departamentos')
  async departamentos() {
    return this.prisma.departamento.findMany({
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
