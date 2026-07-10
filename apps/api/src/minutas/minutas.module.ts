import { Module } from '@nestjs/common';
import { MinutasController } from './minutas.controller';
import { MinutasService } from './minutas.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MinutasController],
  providers: [MinutasService, PrismaService],
})
export class MinutasModule {}
