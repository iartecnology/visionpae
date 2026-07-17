import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CatalogoController],
  providers: [CatalogoService, PrismaService],
})
export class CatalogoModule {}
