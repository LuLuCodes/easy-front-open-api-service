import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UsePipes,
  Session,
  Headers,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBody, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ValidationPipe } from '@pipe/validation.pipe';
import { APIVersion } from '@config/global';
import { CatchError } from '@decorator/catch.decorator';
import { CacheService } from '@service/cache.service';
import { GoodsService as GoodsServiceV1 } from './v1.0/goods.service';
//import { GoodsService as GoodsServiceV2 } from './v2.0/goods.service';

import { GetGoodsDTO } from './goods.dto';

@ApiTags('商品API')
@ApiHeader({
  name: 'x-from-swagger',
  description: '如果是swagger发送的请求，会跳过token和sign验证',
  example: 'swagger',
  schema: {
    type: 'string',
    example: 'swagger',
  },
})
@Controller('goods')
export class GoodsController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    private readonly goodsServiceV1: GoodsServiceV1,
  ) {}

  @ApiOperation({
    summary: '获取实物商品spu',
    description: '获取实物商品spu',
  })
  @ApiBody({
    description: '请求参数',
    type: GetGoodsDTO,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('get-goods-spu')
  @CatchError()
  async getGoodsSpu(
    @Session() session,
    @Body() body: GetGoodsDTO,
  ): Promise<any> {
    const { v } = body;
    switch (v) {
      case APIVersion.V1: {
        const response = await this.goodsServiceV1.getGoodsSpu(body);
        return response;
      }
      // case APIVersion.V2: {
      //   const response = await this.goodsServiceV2.getGoodsSpu(body);
      //   return response;
      // }
      default: {
        const response = await this.goodsServiceV1.getGoodsSpu(body);
        return response;
      }
    }
  }
}
