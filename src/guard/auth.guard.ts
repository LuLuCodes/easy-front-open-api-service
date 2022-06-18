import {
  Injectable,
  CanActivate,
  HttpException,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { CacheService } from '@service/cache.service';
import { CacheKey } from '@config/global';
import * as requestIp from 'request-ip';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly cacheService: CacheService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { body, headers } = request;
    const { app_key } = body;
    if (headers['x-from-swagger'] === 'swagger') {
      return true;
    }

    if (!app_key) {
      throw new HttpException('缺少app_key', HttpStatus.UNAUTHORIZED);
    }
    const exist_app_key = await this.cacheService.sismember(
      CacheKey.APP_KEY_SET,
      app_key,
    );

    if (!exist_app_key) {
      throw new HttpException('非法的app_key', HttpStatus.UNAUTHORIZED);
    }

    const status: string = await this.cacheService.hget(
      `${CacheKey.APP_KEY_INFO_HASH}#${app_key}`,
      CacheKey.APP_STATUS,
    );
    if (status === '1') {
      throw new HttpException(
        'app_key已禁用，，请联系客服',
        HttpStatus.UNAUTHORIZED,
      );
    }

    let expire_time: string | number = await this.cacheService.hget(
      `${CacheKey.APP_KEY_INFO_HASH}#${app_key}`,
      CacheKey.APP_KEY_EXPIRE_TIME,
    );

    expire_time = expire_time ? parseInt(expire_time) : 0;
    const now_time = Date.now();
    if (expire_time < now_time) {
      throw new HttpException(
        'app_key已过期，请联系客服',
        HttpStatus.UNAUTHORIZED,
      );
    }

    let client_ip =
      request.clientIp ||
      headers['x-forwarded-for'] ||
      requestIp.getClientIp(request);
    client_ip = client_ip.replace('::ffff:', '');
    if (client_ip !== '127.0.0.1') {
      const exist_client_ip = await this.cacheService.sismember(
        `${CacheKey.APP_KEY_IP_WHITE_SET}#${app_key}`,
        client_ip,
      );
      if (!exist_client_ip) {
        throw new HttpException(
          '请求IP不在白名单内，请配置白名单',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    return true;
  }
}
