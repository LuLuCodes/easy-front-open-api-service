import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TApp, TAppIpWhiteList } from '@models/index';

@Module({
  imports: [SequelizeModule.forFeature([TApp, TAppIpWhiteList])],
  exports: [SequelizeModule],
  controllers: [],
  providers: [],
})
export class DBModule {}
