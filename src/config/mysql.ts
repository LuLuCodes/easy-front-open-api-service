import { envNumber, env } from '@libs/env-unit';
import { registerAs } from '@nestjs/config';

export default registerAs('mysql', () => ({
  host: env('DB_HOST', ''),
  port: envNumber('DB_PORT', 3306),
  database: env('DB_NAME', 'easy_front_mall_db'),
  username: env('DB_USERNAME', ''),
  password: env('DB_PASSWORD', ''),
}));
