import { Module } from '@nestjs/common';
import { UbicacionController } from './ubicacion.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [UbicacionController],
  providers: [PrismaService],
})
export class UbicacionModule {}
