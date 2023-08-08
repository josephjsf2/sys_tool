import { RedisLockException } from './../../common/exceptions/redis-lock.exception';
import { RedisConfig } from './../../common/models/redis-config';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import IORedis, * as Redis from 'ioredis';
import * as Redlock from 'redlock';
import {
  catchError,
  finalize,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Logger } from 'src/common/utils/logger';
import winston from 'winston';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: IORedis.Redis;
  redisConfig: RedisConfig;
  idx = 0;
  logger: winston.Logger = Logger.createLogger(
    RedisService.name,
    './logs/redis',
    'redis',
  );

  constructor(private cfgService: ConfigService) {
    this.redisConfig = new RedisConfig(
      this.cfgService.get('redisUrl'),
      this.cfgService.get('redisPort'),
      this.cfgService.get('redisDb'),
      this.cfgService.get('redisUser'),
      this.cfgService.get('redisPwd'),
    );
  }

  async onModuleInit() {
    await this.createRedisInstance();
  }

  getClient(): IORedis.Redis {
    return this.client;
  }

  async createRedisInstance() {
    if (!this.client) {
      this.client = new Redis({
        ...this.redisConfig,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    }
    this.client.on('error', (err) =>
      this.logger.error('Create redis client failed.', err),
    );
  }

  async setValue(key: string, value: any);
  async setValue(key: string, value: any, ttl: number);
  async setValue(key: string, value: any, ttl?: number) {
    if (!this.client) {
      await this.createRedisInstance();
    }
    const timeToLive = ttl || 30;

    return await this.client.set(key, value, 'EX', timeToLive);
  }

  async getValue(key: string) {
    return await this.client.get(key);
  }

  async setObject(key: string, value: any, ttl?: number) {
    return this.setValue(key, JSON.stringify(value), ttl);
  }

  async getObject(key: string): Promise<any> {
    const val = await this.getValue(key);
    if (val) {
      return JSON.parse(val);
    }
    return val;
  }

  async setExpire(key: string, ttl: number) {
    return await this.client.expire(key, ttl);
  }

  async hmset(key: string, map: Map<string, any>) {
    const tmpMap = new Map<string, string>();
    for (const k of map.keys()) {
      let val = map.get(k);
      if (typeof val !== 'object' && typeof val !== 'string') {
        val = k + '';
      }
      const writeVal: string =
        typeof val === 'string' ? val : JSON.stringify(val);
      tmpMap.set(key, writeVal);
    }
    return this.client.hmset(key, map);
  }

  async hset(key: string, field: string, value: any) {
    let writeVal = value;
    if (typeof value === 'object') {
      writeVal = JSON.stringify(value);
    }
    this.client.hset(key, field, writeVal);
  }

  async hget(key: string, field: string): Promise<any> {
    return this.parseStrToJSON(await this.client.hget(key, field));
  }

  async hgetall<T>(key: string): Promise<Map<any, any>> {
    const rawMap = await this.client.hgetall(key);
    if (!rawMap) {
      return new Map();
    }
    const map = new Map<string, T>();
    for (const k of Object.keys(rawMap)) {
      map.set(k, this.parseStrToJSON(rawMap[k]));
    }
    return map;
  }

  async deleteKey(key) {
    return await this.client.del(key);
  }

  parseStrToJSON(str: string) {
    let val: any = str;
    try {
      val = JSON.parse(str);
    } catch (err) {
      this.logger.error(`Failed to parse json from string: `, str);
      this.logger.error(`Error: `, err);
    }
    return val;
  }

  lock(
    clients: IORedis.Redis[],
    key: string,
    lockOption?: LockOption,
    lockExpire?: number,
  ): Observable<Redlock> {
    let option = lockOption;
    if (!lockOption || typeof lockOption !== 'object') {
      option = new LockOption();
    }

    const expire = lockExpire || 200;

    const redlock = new Redlock(clients, { ...option, ...new LockOption() });
    return from(redlock.lock(key, expire));
  }

  unlock(lock: Redlock): Observable<any> {
    return from(lock.unlock()).pipe(
      catchError((err) => {
        this.logger.error(
          `Failed to unlock resource: [${err.name}] - ${err.message}`,
        );
        return of(null);
      }),
    );
  }

  /**
   * 執行 Observable 過程中使用 redlock 鎖定 redis key，避免同時間多個process 改動同一個 key 值
   * @param observable
   * @param clients 連線 Redis client，Redis 可為多台不同主機
   * @param key 要鎖定之 key
   * @param lockOption redlock option
   * @param lockExpire lock expire時間，應避免設定過長時間，Redis 出錯時，只能等到 lock 過期後才可繼續寫入
   * @returns
   */
  wrapObservableWithLock<T>(
    observable: Observable<T>,
    clients: IORedis.Redis[],
    key: string,
    lockOption?: LockOption,
    lockExpire?: number,
  ) {
    let redLock: Redlock;
    let execData: T;

    return this.lock(clients, key, lockOption, lockExpire).pipe(
      tap((lock) => (redLock = lock)),
      switchMap((_) => observable),
      tap((data) => (execData = data)),
      finalize(() => this.unlock(redLock).subscribe()),
      map((_) => execData),
      catchError((err) => {
        if (err.name === 'LockError') {
          this.logger.error(`Lock resource failed. [ ${err.message} ]`);
          throw new RedisLockException(err.message);
        }
        throw err;
      }),
    );
  }
}

export class LockOption {
  // the expected clock drift; for more details
  // see http://redis.io/topics/distlock
  driftFactor: 0.01; // multiplied by lock ttl to determine drift time

  // the max number of times Redlock will attempt
  // to lock a resource before erroring
  retryCount: 20;

  // the time in ms between attempts
  retryDelay: 200; // time in ms

  // the max time in ms randomly added to retries
  // to improve performance under high contention
  // see https://www.awsarchitectureblog.com/2015/03/backoff.html
  retryJitter: 200; // time in ms
}
