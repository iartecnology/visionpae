import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { RuplModule } from './rupl/rupl.module';
import { ComprasModule } from './compras/compras.module';
import { CertificacionModule } from './certificacion/certificacion.module';
import { MinutasModule } from './minutas/minutas.module';
import { RuedasModule } from './ruedas/ruedas.module';
import { ReportesModule } from './reportes/reportes.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { IncidenciasModule } from './incidencias/incidencias.module';
import { ActasReciboModule } from './actas-recibo/actas-recibo.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { SincronizacionModule } from './sincronizacion/sincronizacion.module';
import { UbicacionModule } from './ubicacion/ubicacion.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 100, ttl: 60000 }],
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    RuplModule,
    ComprasModule,
    CertificacionModule,
    MinutasModule,
    RuedasModule,
    ReportesModule,
    FeatureFlagsModule,
    IncidenciasModule,
    ActasReciboModule,
    NotificacionesModule,
    SincronizacionModule,
    UbicacionModule,
    CatalogoModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
