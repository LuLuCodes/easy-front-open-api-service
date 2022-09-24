/*
 * @Author: leyi leyi@myun.info
 * @Date: 2022-06-18 12:19:15
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2022-09-24 15:12:35
 * @FilePath: /easy-front-open-api-service/src/filter/validation-exception-filter.ts
 * @Description:
 *
 * Copyright (c) 2022 by leyi leyi@myun.info, All Rights Reserved.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';

import { ResponseCode } from '@config/global';

import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter
  implements ExceptionFilter<BadRequestException>
{
  public catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse() as Response;

    let msg = exception.message;
    if (exception.response && exception.response.message) {
      if (typeof exception.response.message === 'string') {
        msg = exception.response.message;
      } else if (exception.response.message.length) {
        msg = exception.response.message[0];
      }
    }
    response.status(200).json({
      code: ResponseCode.PARM_ERROR,
      msg,
    });
  }
}
