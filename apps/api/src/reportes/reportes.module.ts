import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ReportesController],
  providers: [PrismaService],
})
export class ReportesModule {}
