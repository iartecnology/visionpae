import { Module } from '@nestjs/common';
import { RuedasController } from './ruedas.controller';
import { RuedasService } from './ruedas.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RuedasController],
  providers: [RuedasService, PrismaService],
})
export class RuedasModule {}
