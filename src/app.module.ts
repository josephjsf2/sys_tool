import { RedisConfig } from './common/models/redis-config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import appConfig from './core/configs/app.config';
import { CoreModule } from './core/core.module';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import dbConfig from './core/configs/ds.config';
import adConfig from './core/configs/ad.config';
import redisConfig from './core/configs/redis.config';

const BASE_DIR_CFG = () => ({
  rootDir: join(__dirname, '..'),
  envDir: join(__dirname, '..', 'environments'),
});
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['environments/.env'],
      load: [BASE_DIR_CFG, appConfig, redisConfig, adConfig],
      expandVariables: true,
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({ useFactory: dbConfig }),
    CoreModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
