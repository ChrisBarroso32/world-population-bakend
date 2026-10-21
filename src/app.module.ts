import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './lib/database/prisma.module';
import { DemographicsModule } from './module/demographics/demographics.module';

@Module({
  imports: [PrismaModule, DemographicsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
