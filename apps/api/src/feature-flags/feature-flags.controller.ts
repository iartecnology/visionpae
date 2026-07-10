import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';
import { TenantGuard } from '../auth/tenant.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('feature-flags')
@UseGuards(AuthGuard('jwt'))
export class FeatureFlagsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async listar(@Req() req: any) {
    return this.prisma.featureFlag.findMany({
      where: { tenantId: req.user.tenantId },
      select: { flag: true, habilitado: true, config: true, updatedAt: true },
      orderBy: { flag: 'asc' },
    });
  }

  @Patch(':flag')
  @UseGuards(RolesGuard)
  @Roles('super_admin')
  async toggle(@Param('flag') flag: string, @Body() body: { habilitado: boolean }, @Req() req: any) {
    return this.prisma.featureFlag.upsert({
      where: { tenantId_flag: { tenantId: req.user.tenantId, flag } },
      create: { tenantId: req.user.tenantId, flag, habilitado: body.habilitado, updatedBy: req.user.id },
      update: { habilitado: body.habilitado, updatedBy: req.user.id },
    });
  }
}
