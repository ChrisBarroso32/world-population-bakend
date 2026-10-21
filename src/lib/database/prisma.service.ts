import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import databaseConfig from './database.config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // @Inject explícito: tsx (seed) no emite emitDecoratorMetadata.
  constructor(
    @Inject(databaseConfig.KEY)
    config: ConfigType<typeof databaseConfig>,
  ) {
    super({ adapter: new PrismaPg({ connectionString: config.url }) });
  }

  async onModuleInit() {
    await this.$connect();
    // $connect() no abre la conexión real con el adaptador pg; se precalienta
    // el pool (TLS + handshake) para que la primera petición no la pague.
    await this.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
