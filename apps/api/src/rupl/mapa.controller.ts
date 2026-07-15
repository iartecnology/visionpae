import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RuplService } from './rupl.service';
import { BuscarMapaDto } from './dto';

@Controller('rupl/mapa')
export class MapaController {
  constructor(private readonly rupl: RuplService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async mapa(@Query() filtros: BuscarMapaDto, @Req() req: any) {
    return this.rupl.mapa({ ...filtros, tenantId: req.user.tenantId });
  }
}
