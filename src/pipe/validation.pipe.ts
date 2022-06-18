import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoggerFactory } from '@libs/log4js';
const logger = LoggerFactory.getInstance();

@Injectable()
export class ValidationPipe implements PipeTransform {
  private isTransformEnabled;
  constructor(options) {
    const { transform } = options;
    this.isTransformEnabled = !!transform;
  }
  async transform(value: any, metadata: any): Promise<any> {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return this.isTransformEnabled
        ? this.transformPrimitive(value, metadata)
        : value;
    }
    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      const constraints = this.getConstraints(errors[0]);
      if (constraints) {
        const msg = Object.values(constraints)[0];
        logger.error(`Validation failed: ${msg}`);
        throw new BadRequestException(msg);
      } else {
        logger.error(`Validation failed: Validation failed`);
        throw new BadRequestException('Validation failed');
      }
    }
    if (this.isTransformEnabled) {
      return object;
    }
    return value;
  }

  private getConstraints(error) {
    if (error.constraints) {
      return error.constraints;
    }
    for (const child of error.children) {
      const constraints = this.getConstraints(child);
      if (constraints) {
        return constraints;
      }
    }
    return null;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private transformPrimitive(value, metadata) {
    if (!metadata.data) {
      // leave top-level query/param objects unmodified
      return value;
    }
    const { type, metatype } = metadata;
    if (type !== 'param' && type !== 'query') {
      return value;
    }
    if (metatype === Boolean) {
      return value === true || value === 'true';
    }
    if (metatype === Number) {
      return +value;
    }
    return value;
  }
}
