import { Controller, Get, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { email: string; password: string }) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: { refreshToken: string }) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        tenant: true,
      },
    });

    if (!user) return { user: null, permissions: [], tenant: null };

    return {
      user: {
        id: user.id,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        role: user.role
          ? { id: user.role.id, codigo: user.role.codigo, nombre: user.role.nombre }
          : null,
      },
      permissions: user.role
        ? user.role.permissions.map((rp) => rp.permission.codigo)
        : [],
      tenant: {
        id: user.tenant.id,
        nombre: user.tenant.nombre,
        slug: user.tenant.slug,
        logoUrl: user.tenant.logoUrl,
        config: user.tenant.config as Record<string, unknown>,
      },
    };
  }
}
