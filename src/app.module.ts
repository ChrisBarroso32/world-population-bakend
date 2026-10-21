import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { AppConfigModule } from './config/env.validation';
import { AppCacheModule } from './lib/cache/cache.module';
import { PrismaModule } from './lib/database/prisma.module';
import { DemographicsModule } from './module/demographics/demographics.module';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule.forFeature(appConfig),
    AppCacheModule,
    PrismaModule,
    DemographicsModule,
  ],
})
export class AppModule {}
