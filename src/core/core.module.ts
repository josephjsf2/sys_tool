import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CookieService } from 'src/core/services/cookie.service';
import { RestService } from './services/rest.service';
import { RedisService } from './services/redis.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  providers: [CookieService, RestService, RedisService],
  imports: [
    TypeOrmModule.forFeature([]),
    HttpModule,
    ConfigModule.forFeature(() => ({})),
  ],
  exports: [CookieService, RestService, HttpModule, RedisService],
})
export class CoreModule {}
