import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';

// Los datos demográficos son estáticos (seed), así que un TTL largo es seguro.
export const CACHE_TTL_MS = 60 * 60 * 1000;

@Global()
@Module({
  imports: [CacheModule.register({ ttl: CACHE_TTL_MS })],
  exports: [CacheModule],
})
export class AppCacheModule {}
