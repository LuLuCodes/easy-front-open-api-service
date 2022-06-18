import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Sequelize } from 'sequelize-typescript';
import { Op, FindAndCountOptions, QueryTypes, DataTypes } from 'sequelize';

@Injectable()
export class CronTaskService {
  constructor(private sequelize: Sequelize) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    console.log('this is cron task');
  }
}
