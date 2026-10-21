import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
