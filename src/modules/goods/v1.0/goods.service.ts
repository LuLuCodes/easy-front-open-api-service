import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op, FindAndCountOptions, QueryTypes } from 'sequelize';
import { CacheService } from '@service/cache.service';
import { CacheKey } from '@config/global';
import { GetGoodsDTO } from '../goods.dto';
import * as _ from 'lodash';

@Injectable()
export class GoodsService {
  constructor(
    private sequelize: Sequelize,
    private cacheService: CacheService,
    @InjectQueue('queue') private queue: Queue,
  ) {}

  // 获取实物商品
  async getGoodsSpu(requestBody: GetGoodsDTO): Promise<any> {
    console.log(`requestBody: ${JSON.stringify(requestBody)}`);
    return { rows: [], count: 0 };
  }
}
