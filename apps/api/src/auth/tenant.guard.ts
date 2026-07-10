import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return true;

    const tenantId = user.tenantId || request.headers['x-tenant-id'];
    if (tenantId) {
      request.tenantId = tenantId;
    }

    return true;
  }
}
