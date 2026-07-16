import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma.service';

@Controller('admin/permissions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('super_admin', 'admin_entidad')
export class PermissionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async listar() {
    const perms = await this.prisma.permission.findMany({
      orderBy: [{ recurso: 'asc' }, { accion: 'asc' }],
    });

    const grouped: Record<string, { recurso: string; permisos: typeof perms }> = {};
    for (const p of perms) {
      if (!grouped[p.recurso]) grouped[p.recurso] = { recurso: p.recurso, permisos: [] };
      grouped[p.recurso].permisos.push(p);
    }

    return Object.values(grouped);
  }
}
