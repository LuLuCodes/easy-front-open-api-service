import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from '@service/cache.service';
import { InjectModel } from '@nestjs/sequelize';
import { DBModule } from './db.module';
import { CacheKey } from '@config/global';
import { TApp, TAppIpWhiteList } from '@models/index';

@Module({
  imports: [DBModule, ConfigModule],
  providers: [CacheService],
})
export class InitModule implements OnModuleInit {
  constructor(
    private readonly cacheService: CacheService,
    @InjectModel(TApp)
    private readonly tApp: typeof TApp,
    @InjectModel(TAppIpWhiteList)
    private readonly tAppIpWhiteList: typeof TAppIpWhiteList,
    private readonly configService: ConfigService,
  ) {}
  async onModuleInit(): Promise<void> {
    await this.initApp();
  }
  async initApp(): Promise<void> {
    const app_list = await this.tApp.findAll({
      attributes: [
        'app_key',
        'app_secret',
        'expire_time',
        'goods_update_callback_url',
        'order_update_callback_url',
        'status',
      ],
      where: {
        deleted: 0,
      },
      raw: true,
    });
    await this.cacheService.del(CacheKey.APP_KEY_SET);
    for (const app of app_list) {
      const {
        app_key,
        app_secret,
        expire_time,
        goods_update_callback_url,
        order_update_callback_url,
        status,
      } = app;
      this.cacheService.sadd(CacheKey.APP_KEY_SET, [app_key]);
      this.cacheService.hmset(`${CacheKey.APP_KEY_INFO_HASH}#${app_key}`, [
        CacheKey.APP_KEY_SECRET,
        app_secret,
        CacheKey.APP_KEY_EXPIRE_TIME,
        new Date(expire_time).getTime(),
        CacheKey.APP_GOODS_UPDATE_CB,
        goods_update_callback_url,
        CacheKey.APP_ORDER_UPDATE_CB,
        order_update_callback_url,
        CacheKey.APP_STATUS,
        status,
      ]);

      const ip_list = await this.tAppIpWhiteList.findAll({
        attributes: ['ip'],
        where: {
          deleted: 0,
          app_key,
        },
        raw: true,
      });

      await this.cacheService.del(
        `${CacheKey.APP_KEY_IP_WHITE_SET}#${app_key}`,
      );
      if (ip_list && ip_list.length) {
        const list = ip_list.map((item) => {
          return item.ip;
        });

        await this.cacheService.sadd(
          `${CacheKey.APP_KEY_IP_WHITE_SET}#${app_key}`,
          list,
        );
      }
    }
  }
}
