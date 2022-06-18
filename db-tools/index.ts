import {
  IConfig,
  ModelBuilder,
  DialectMySQL,
} from 'sequelize-typescript-generator';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: resolve(__dirname, '../src/.env') });

(async () => {
  const config: IConfig = {
    connection: {
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    metadata: {
      indices: true,
      case: {
        model: 'PASCAL',
        column: 'LOWER',
      },
    },
    output: {
      clean: true,
      outDir: resolve(__dirname, '../src/models'),
    },
    strict: false,
  };

  const dialect = new DialectMySQL();

  const builder = new ModelBuilder(config, dialect);

  try {
    await builder.build();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
