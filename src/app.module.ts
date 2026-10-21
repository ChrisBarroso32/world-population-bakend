import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { AppConfigModule } from './config/env.validation';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './lib/database/prisma.module';
import { DemographicsModule } from './module/demographics/demographics.module';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule.forFeature(appConfig),
    PrismaModule,
    DemographicsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
