import { Module } from '@nestjs/common';
import { RuplController } from './rupl.controller';
import { RuplService } from './rupl.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RuplController],
  providers: [RuplService, PrismaService],
})
export class RuplModule {}
