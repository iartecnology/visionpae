import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasourceUrl: process.env.DATABASE_URL,
    });
  }

  async setTenantId(tenantId: string) {
    await this.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
  }

  async setUserRoles(roles: string[]) {
    await this.$executeRawUnsafe(
      `SELECT set_config('app.user_roles', $1, true)`,
      JSON.stringify(roles),
    );
  }
}
