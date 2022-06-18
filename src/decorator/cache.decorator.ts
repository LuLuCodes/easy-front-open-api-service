import { OkResponse, ErrorResponse } from '@libs/util';
import { ResponseCode } from '@config/global';
import * as _ from 'lodash';

// 访问数据库，并缓存结果
export const SaveCache =
  (): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        const arg = args[0];
        if (arg && this.cacheService) {
          const { cache_key, del_cache_key } = arg;
          let { cache_mode, cache_time } = arg;
          if (del_cache_key) {
            for (const del_key of del_cache_key) {
              await this.cacheService.del(del_key);
            }
          }
          if (cache_key) {
            cache_mode = cache_mode || 'EX';
            cache_time = cache_time || Math.floor(Math.random() * 20);
            await this.cacheService.set(
              cache_key,
              JSON.stringify(result),
              cache_mode,
              cache_time,
            );
          }
        }
        return OkResponse(result);
      } catch (error) {
        return ErrorResponse(ResponseCode.SYS_ERROR, error);
      }
    };
    return descriptor;
  };

// 先从缓存中获取，获取不到则访问数据库，并将结果缓存
export const UseCache =
  (): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        const arg = args[0];
        if (!this.cacheService || !arg) {
          const result = await originalMethod.apply(this, args);
          return OkResponse(result);
        }

        const { cache_key, del_cache_key } = arg;
        let { cache_mode, cache_time } = arg;
        if (del_cache_key) {
          for (const del_key of del_cache_key) {
            await this.cacheService.del(del_key);
          }
        }
        if (!cache_key) {
          const result = await originalMethod.apply(this, args);
          return OkResponse(result);
        }
        let result = await this.cacheService.get(cache_key);
        if (result) {
          return OkResponse(JSON.parse(result));
        }

        result = await originalMethod.apply(this, args);
        cache_mode = cache_mode || 'EX';
        cache_time = cache_time || Math.floor(Math.random() * 20);
        await this.cacheService.set(
          cache_key,
          JSON.stringify(result),
          cache_mode,
          cache_time,
        );
        return OkResponse(result);
      } catch (error) {
        return ErrorResponse(ResponseCode.SYS_ERROR, error);
      }
    };
    return descriptor;
  };

// 清除缓存，并访问数据库
export const ClearCache =
  (): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        const arg = args[0];
        if (this.cacheService && arg) {
          const { del_cache_key } = arg;
          if (del_cache_key) {
            for (const del_key of del_cache_key) {
              await this.cacheService.del(del_key);
            }
          }
        }

        const result = await originalMethod.apply(this, args);
        return OkResponse(result);
      } catch (error) {
        return ErrorResponse(ResponseCode.SYS_ERROR, error);
      }
    };
    return descriptor;
  };
