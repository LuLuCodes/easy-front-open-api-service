import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { LoggerFactory } from '@libs/log4js';

const logger = LoggerFactory.getInstance();
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: NextFunction): void {
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [];
    res.write = function (...restArgs) {
      chunks.push(Buffer.from(restArgs[0]));

      return oldWrite.apply(res, restArgs);
    };

    res.end = function (...restArgs) {
      if (restArgs[0]) {
        chunks.push(Buffer.from(restArgs[0]));
      }
      const data = Buffer.concat(chunks).toString('utf8');

      oldEnd.apply(res, restArgs);
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
    };
    next();
  }
}
