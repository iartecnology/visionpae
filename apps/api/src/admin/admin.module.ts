import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { UsuariosController } from './usuarios.controller';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TenantsController, UsuariosController, RolesController, PermissionsController],
  providers: [PrismaService],
})
export class AdminModule {}
