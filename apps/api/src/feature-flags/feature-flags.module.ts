import { Module } from '@nestjs/common';
import { FeatureFlagsController } from './feature-flags.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [FeatureFlagsController],
  providers: [PrismaService],
})
export class FeatureFlagsModule {}
