import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// import { LoggerFunMiddleware } from '@middleware/logger.middleware';
// import { TransformInterceptor } from '@interceptor/transform.interceptor';
import { HttpExceptionFilter } from '@filter/http-exception.filter';
import { AllExceptionsFilter } from '@filter/any-exception.filter';
import { ValidationExceptionFilter } from '@filter/validation-exception-filter';
import { RedisLock } from '@libs/redlock';
// import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as ConnectRedis from 'connect-redis';
import * as session from 'express-session';
import { createClient } from 'redis';

const RedisStore = ConnectRedis(session);
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.use(function (req, res, next) {
    const headers = req.headers['content-type'];
    if (headers && headers.indexOf('utf8') > -1) {
      req.headers['content-type'] = headers.replace('utf8', 'utf-8');
    }
    next();
  });
  // app.use(
  //   rateLimit({
  //     windowMs: 60 * 1000, // 1 minutes
  //     max: 3000, // limit each IP to 100 requests per windowMs
  //     keyGenerator: function (req) {
  //       const address =
  //         req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  //       const key = address + '_' + req.originalUrl;
  //       return key;
  //     },
  //   }),
  // );
  app.use(helmet());
  app.enableCors({
    origin: true,
    allowedHeaders:
      'Content-Type, X-XSRF-Token, CSRF-Token, X-CSRF-Token, X-Auth-Token',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  app.use(compression());
  app.use(bodyParser.json({ limit: '50mb' })); // For parsing application/json
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: false,
    }),
  ); // For parsing application/x-www-form-urlencoded
  // 使用拦截器打印出参
  // app.useGlobalInterceptors(new TransformInterceptor());
  app.use(cookieParser());
  app.use(
    session({
      store: new RedisStore({
        client: createClient({
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
          db: config.get('redis.cookie_db_index'),
        }),
      }),
      secret: config.get('session.secret'),
      key: config.get('session.key'),
      cookie: config.get('session.cookie'),
      resave: true,
      rolling: true,
      saveUninitialized: false,
    }),
  );
  RedisLock.init({
    socket: {
      host: config.get('redis.host'),
      port: config.get('redis.port'),
    },
    password: config.get('redis.password'),
    database: config.get('cache.redis_db'),
  });
  // 监听所有的请求路由，并打印日志
  // app.use(LoggerFunMiddleware);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new ValidationExceptionFilter());
  // 配置 Swagger
  if (
    config.get('app.node_env') === 'development' ||
    config.get('app.node_env') === 'test'
  ) {
    const options = new DocumentBuilder()
      .addBearerAuth() // 开启 BearerAuth 授权认证
      .setTitle(config.get('app.name'))
      .setDescription(config.get('app.desc'))
      .setVersion(config.get('app.version'))
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-doc', app, document);
  }
  await app.listen(config.get('app.port'));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
