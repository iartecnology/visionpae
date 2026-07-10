import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

const REFRESH_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, activo: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() },
    });

    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      roles: [user.rol],
      email: user.email,
    };

    const accessToken = this.jwt.sign(payload);

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN_MS),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: refreshToken,
        userId: payload.sub,
        expiresAt: { gte: new Date() },
      },
      include: { user: true },
    });

    if (!stored || !stored.user.activo) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const newPayload = {
      sub: stored.user.id,
      tenantId: stored.user.tenantId,
      roles: [stored.user.rol],
      email: stored.user.email,
    };

    const newAccessToken = this.jwt.sign(newPayload);
    const newRefreshToken = this.jwt.sign(newPayload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: stored.user.id,
        tokenHash: newRefreshToken,
        expiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN_MS),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
