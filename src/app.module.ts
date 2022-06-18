import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { SequelizeModule } from '@nestjs/sequelize';
import { join, resolve } from 'path';

import { LoggerMiddleware } from './middleware/logger.middleware';
import { SignGuard } from '@guard/sign.guard';
import { AuthGuard } from '@guard/auth.guard';
import { CacheService } from '@service/cache.service';
import { CronTaskService } from '@service/cron-task.service';
import { HttpService } from '@service/http.service';

import app_config from '@config/app';
import databse_config from '@config/databse';
import redis_config from '@config/redis';
import session_config from '@config/session';

import { DBModule } from './db.module';
import { InitModule } from './init.module';
import { GoodsModule } from './modules/goods/goods.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [app_config, databse_config, redis_config, session_config],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'www'),
      exclude: ['/api*'],
    }),
    HttpModule.registerAsync({
      useClass: HttpService,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          closeClient: true,
          config: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
            db: configService.get('redis.cache_db_index'),
          },
        };
      },
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          dialect: 'mysql',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          timezone: '+08:00',
          pool: {
            max: 20,
            min: 5,
            acquire: 60000,
            idle: 10000,
          },
          modelPaths: [resolve(__dirname, './models', '**/!(index).{ts,js}')],
          retryAttempts: 3, // 数据链接重试次数
          retryDelay: 2000, // 连接重试尝试之间的延迟(ms)
          logQueryParameters: true,
          define: {
            defaultScope: {
              where: {
                deleted: 0,
              },
            },
            hooks: {
              beforeCreate(attributes: any, options: any) {
                const { fields } = options;
                const now = Date.now();
                if (
                  !attributes.dataValues.create_time &&
                  fields.indexOf('create_time') !== -1
                ) {
                  attributes.dataValues.create_time = now;
                }
                if (
                  !attributes.dataValues.update_time &&
                  fields.indexOf('update_time') !== -1
                ) {
                  attributes.dataValues.update_time = now;
                }
              },
              beforeBulkCreate(instances: any, options: any) {
                const { fields } = options;
                const now = Date.now();
                for (const instance of instances) {
                  if (
                    !instance.dataValues.create_time &&
                    fields.indexOf('create_time') !== -1
                  ) {
                    instance.dataValues.create_time = now;
                  }
                  if (
                    !instance.dataValues.update_time &&
                    fields.indexOf('update_time') !== -1
                  ) {
                    instance.dataValues.update_time = now;
                  }
                }
              },
              beforeUpdate(instance: any, options: any) {
                const { fields } = options;
                const now = Date.now();
                if (
                  !instance.dataValues.create_time &&
                  fields.indexOf('update_time') !== -1
                ) {
                  instance.dataValues.update_time = now;
                }
              },
              beforeBulkUpdate(options: any) {
                const { attributes, fields } = options;
                fields.push('update_time');
                attributes.update_time = Date.now();
              },
            },
          },
          dialectOptions: {
            decimalNumbers: true,
            multipleStatements: true,
          },
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          db: configService.get('redis.queue_db_index'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'open-api-log',
    }),
    DBModule,
    InitModule,
    GoodsModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SignGuard,
    },
    CacheService,
    CronTaskService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
