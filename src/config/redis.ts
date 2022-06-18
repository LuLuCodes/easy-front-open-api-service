import { envNumber, env } from '@libs/env-unit';
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: env('REDIS_HOST', '127.0.0.1'),
  port: envNumber('REDIS_PORT', 6379),
  cookie_db_index: envNumber('COOKIE_REDIS_DB_INDEX', 0),
  cache_db_index: envNumber('CACHE_REDIS_DB_INDEX', 1),
  queue_db_index: envNumber('QUEUE_REDIS_DB_INDEX', 2),
}));
