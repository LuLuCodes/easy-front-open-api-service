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
