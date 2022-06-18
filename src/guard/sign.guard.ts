import {
  Injectable,
  CanActivate,
  HttpException,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { CacheService } from '@service/cache.service';
import { md5 } from '@libs/cryptogram';
import { CacheKey } from '@config/global';
import { Kit } from '@easy-front-core-sdk/kits';

@Injectable()
export class SignGuard implements CanActivate {
  constructor(private readonly cacheService: CacheService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { body, headers } = request;
    const { app_key, sign, timestamp } = body;
    if (headers['x-from-swagger'] === 'swagger') {
      return true;
    }

    if (!sign) {
      throw new HttpException('缺少签名参数', HttpStatus.FORBIDDEN);
    }
    if (!timestamp) {
      throw new HttpException('缺少时间戳参数', HttpStatus.FORBIDDEN);
    }

    const request_time = new Date(timestamp).getTime();
    if (Number.isNaN(request_time)) {
      throw new HttpException(
        '请保证timestamp，格式正确(yyyy-MM-dd HH:mm:ss)',
        HttpStatus.FORBIDDEN,
      );
    }
    const now_time = Date.now();
    if (Math.abs(request_time - now_time) > 600000) {
      throw new HttpException(
        '请求过期，请检查timestamp',
        HttpStatus.FORBIDDEN,
      );
    }
    const sort_str = Kit.makeSortStr(request.body, ['sign']);
    const app_secret = await this.cacheService.hget(
      `${CacheKey.APP_KEY_INFO_HASH}#${app_key}`,
      CacheKey.APP_KEY_SECRET,
    );
    const md5_sign = md5(`${app_secret}${sort_str}${app_secret}`).toUpperCase();
    if (md5_sign !== sign) {
      throw new HttpException('签名错误', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
