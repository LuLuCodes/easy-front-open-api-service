import * as redlock from 'redlock';
import * as redis from 'redis';

export class RedisLock {
  private static redisClient = null;
  private static redisLock = null;

  public static init(config) {
    this.redisClient = redis.createClient(config);

    this.redisLock = new redlock([this.redisClient], {
      // the expected clock drift; for more details
      // see http://redis.io/topics/distlock
      driftFactor: 0.01, // time in ms
      // the max number of times Redlock will attempt
      // to lock a resource before erroring
      retryCount: 15,
      // the time in ms between attempts
      retryDelay: 300, // time in ms
      // the max time in ms randomly added to retries
      // to improve performance under high contention
      // see https://www.awsarchitectureblog.com/2015/03/backoff.html
      retryJitter: 200, // time in ms
    });
  }
  public static getLock() {
    return this.redisLock;
  }
}
