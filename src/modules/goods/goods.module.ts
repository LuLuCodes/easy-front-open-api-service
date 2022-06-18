import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DBModule } from '../../db.module';
import { GoodsService as GoodsServiceV1 } from './v1.0/goods.service';
//import { GoodsService as GoodsServiceV2 } from './v2.0/goods.service';
import { GoodsController } from './goods.controller';
import { CacheService } from '@service/cache.service';

@Module({
  imports: [
    DBModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'queue',
    }),
  ],
  controllers: [GoodsController],
  providers: [GoodsServiceV1, CacheService],
})
export class GoodsModule {}
