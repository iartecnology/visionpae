import { Module } from '@nestjs/common';
import { SincronizacionController } from './sincronizacion.controller';
import { SincronizacionService } from './sincronizacion.service';

@Module({
  controllers: [SincronizacionController],
  providers: [SincronizacionService],
})
export class SincronizacionModule {}
