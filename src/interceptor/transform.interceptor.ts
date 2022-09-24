/*
 * @Author: leyi leyi@myun.info
 * @Date: 2021-11-25 17:08:33
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2022-09-24 16:14:43
 * @FilePath: /easy-front-open-api-service/src/interceptor/transform.interceptor.ts
 * @Description:
 *
 * Copyright (c) 2022 by leyi leyi@myun.info, All Rights Reserved.
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OkResponse } from '@libs/util';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    return next.handle().pipe(
      map((data) => {
        if (req.body && req.body.ef_author) {
          data.ef_author = 'qian.qing@aliyun.com';
        }
        res.status(HttpStatus.OK);
        return OkResponse(data);
      }),
    );
  }
}
