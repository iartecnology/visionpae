import { Module } from '@nestjs/common';
import { RuplController } from './rupl.controller';
import { MapaController } from './mapa.controller';
import { RuplService } from './rupl.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RuplController, MapaController],
  providers: [RuplService, PrismaService],
})
export class RuplModule {}
