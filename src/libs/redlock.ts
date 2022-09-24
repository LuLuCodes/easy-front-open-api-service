/*
 * @Author: leyi leyi@myun.info
 * @Date: 2021-09-22 21:55:56
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2022-09-24 15:08:26
 * @FilePath: /easy-front-open-api-service/src/libs/redlock.ts
 * @Description:
 *
 * Copyright (c) 2022 by leyi leyi@myun.info, All Rights Reserved.
 */
import Redlock from 'redlock';
import Redis from 'ioredis';

export class RedisLock {
  private static redis = null;
  private static redlock = null;

  public static async init(config) {
    this.redis = new Redis({ ...config, legacyMode: true });
    this.redlock = new Redlock([this.redis], {
      // the expected clock drift; for more details
      // see http://redis.io/topics/distlock
      driftFactor: 0.01, // time in ms
      // the max number of times Redlock will attempt
      // to lock a resource before erroring
      retryCount: 15,
      // the time in ms between attempts
      retryDelay: 200, // time in ms
      // the max time in ms randomly added to retries
      // to improve performance under high contention
      // see https://www.awsarchitectureblog.com/2015/03/backoff.html
      retryJitter: 200, // time in ms
      // The minimum remaining time on a lock before an extension is automatically
      // attempted with the `using` API.
      automaticExtensionThreshold: 500, // time in ms
    });
  }
  public static getLock() {
    return this.redlock;
  }

  public static async lock(key: string, lock_time: number) {
    if (!this.redlock) {
      return null;
    }
    try {
      return await this.redlock.lock([key], lock_time);
    } catch (error) {
      console.error(`redlock lock error: ${error.message}`);
    }
    return null;
  }

  public static async unlock(lock: any) {
    if (!lock) {
      return null;
    }
    try {
      await lock.release();
    } catch (error) {
      console.error(`redlock unlock error: ${error.message}`);
    }
  }
}
