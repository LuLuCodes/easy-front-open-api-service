import { Injectable, NestMiddleware } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { NextFunction } from 'express';
import { LoggerFactory } from '@libs/log4js';

const logger = LoggerFactory.getInstance();
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use_log_queue = false;
  constructor(
    @InjectQueue('open-api-log') private logQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.use_log_queue = this.configService.get('app.use_log_queue');
  }
  use(req: any, res: any, next: NextFunction): void {
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [];
    res.write = function (...restArgs) {
      chunks.push(Buffer.from(restArgs[0]));

      return oldWrite.apply(res, restArgs);
    };
    res.end = async (...restArgs) => {
      if (restArgs[0]) {
        chunks.push(Buffer.from(restArgs[0]));
      }
      const data = Buffer.concat(chunks).toString('utf8');

      oldEnd.apply(res, restArgs);
      if (this.use_log_queue) {
        await this.logQueue.add(
          {
            app_key:
              req.body.app_key ||
              req.params.app_key ||
              req.query.app_key ||
              'default',
            from_ip:
              req.headers['x-forwarded-for'] ||
              req.connection.remoteAddress ||
              req.ip ||
              'unkown',
            url: req.originalUrl,
            method: req.method,
            request_session: req.session,
            request_params: req.params,
            request_query: req.query,
            request_body: req.body,
            referer: req.headers.referer || '',
            ua: req.headers.referer || '',
            response_status_code: res.statusCode,
            response_data: data,
            time: Date.now(),
          },
          {
            attempts: 3,
            delay: 20,
            removeOnComplete: true,
            removeOnFail: true,
          },
        );
      } else {
        const logFormat = ` >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        time: ${Date.now()},
        fromIP: ${
          req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress ||
          req.ip
        },
        method: ${req.method},
        originalUri: ${req.originalUrl},
        session: ${JSON.stringify(req.session)},
        requestParmas: ${JSON.stringify(req.params)},
        requestQuery: ${JSON.stringify(req.query)},
        requestBody: ${JSON.stringify(req.body)},
        statusCode: ${res.statusCode},
        responseData: ${JSON.stringify(data)},
        referer: ${req.headers.referer || ''},
        ua: ${
          req.headers['user-agent']
        }, \n  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      `;

        if (res.statusCode >= 500) {
          logger.error(logFormat);
        } else if (res.statusCode >= 400) {
          logger.warn(logFormat);
        } else {
          logger.log(logFormat);
        }
      }
    };
    next();
  }
}
