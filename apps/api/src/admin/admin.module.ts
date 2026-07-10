import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { UsuariosController } from './usuarios.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TenantsController, UsuariosController],
  providers: [PrismaService],
})
export class AdminModule {}
