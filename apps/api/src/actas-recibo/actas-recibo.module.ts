import { Module } from '@nestjs/common';
import { ActasReciboController } from './actas-recibo.controller';
import { ActasReciboService } from './actas-recibo.service';

@Module({
  controllers: [ActasReciboController],
  providers: [ActasReciboService],
})
export class ActasReciboModule {}
