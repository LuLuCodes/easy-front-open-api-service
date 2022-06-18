import { Injectable } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
@Injectable()
export class CacheService {
  public client;
  constructor(private redisService: RedisService) {
    this.getClient();
  }
  async getClient(): Promise<void> {
    this.client = await this.redisService.getClient();
  }

  //判断key是否存在
  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      await this.getClient();
    }
    const result = await this.client.exists(key);
    return result === 1;
  }

  //设置值的方法
  async set(
    key: string,
    value: string | Buffer | number | any[],
    expiryMode?: 'EX' | 'PX',
    seconds?: number,
  ): Promise<void> {
    if (!this.client) {
      await this.getClient();
    }
    if (!seconds) {
      await this.client.set(key, value);
    } else {
      await this.client.set(key, value, expiryMode, seconds);
    }
  }

  //获取值的方法
  async get(key: string): Promise<string> {
    if (!this.client) {
      await this.getClient();
    }
    const data = await this.client.get(key);
    if (!data) return '';
    return data;
  }

  //删除key
  async del(key: string): Promise<void> {
    if (!this.client) {
      await this.getClient();
    }
    this.client.del(key);
    return;
  }

  async decrby(key: string, value: number): Promise<number> {
    if (!this.client) {
      await this.getClient();
    }
    return await this.client.decrby(key, value);
  }

  async incrby(key: string, value: number): Promise<number> {
    if (!this.client) {
      await this.getClient();
    }
    return await this.client.incrby(key, value);
  }

  async sadd(key: string, members: Array<number | string>): Promise<boolean> {
    if (!this.client) {
      await this.getClient();
    }
    return await this.client.sadd(key, ...members);
  }

  async sismember(key: string, member: number | string): Promise<boolean> {
    if (!this.client) {
      await this.getClient();
    }
    const result = await this.client.sismember(key, member);
    return result === 1;
  }
  async hget(key: string, field: string): Promise<string | null> {
    if (!this.client) {
      await this.getClient();
    }
    return await this.client.hget(key, field);
  }

  async hmget(key: string, fields: string[]): Promise<Array<string | null>> {
    if (!this.client) {
      await this.getClient();
    }
    return await this.client.hmget(key, ...fields);
  }

  async hset(
    key: string,
    field: string,
    value: string | number,
  ): Promise<number> {
    if (!this.client) {
      await this.getClient();
    }
    return await this.client.hset(key, field, value);
  }

  async hmset(key: string, args: Array<string | number>): Promise<number> {
    if (!this.client) {
      await this.getClient();
    }
    return await this.client.hmset(key, ...args);
  }
}
