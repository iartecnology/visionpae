import { Controller, Get, Query } from '@nestjs/common';
import { RuplService } from './rupl.service';
import { BuscarMapaDto } from './dto';

@Controller('rupl/mapa')
export class MapaController {
  constructor(private readonly rupl: RuplService) {}

  @Get()
  async mapa(@Query() filtros: BuscarMapaDto) {
    return this.rupl.mapa(filtros);
  }
}
