import { OkResponse, ErrorResponse } from '@libs/util';
import { ResponseCode } from '@config/global';
export const CatchError =
  (): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        return OkResponse(result);
      } catch (error) {
        return ErrorResponse(ResponseCode.SYS_ERROR, error);
      }
    };
    return descriptor;
  };
