import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { EncryptUtils } from 'src/common/utils/encrypt.utils';

const connectOption = {
  encrypt: true,
  trustServerCertificate: true,
};

const connectionConfig = process.env.DB_URL
  ? {
      type: process.env.DB_TYPE as any,
      host: process.env.DB_URL,
      port: parseInt(process.env.DB_PORT),
      username: EncryptUtils.aesDecrypt(process.env.DB_USER),
      password: EncryptUtils.aesDecrypt(process.env.DB_PSD),
      database: process.env.DB_NAME,
      entities: [join(__dirname, '..', '**', '*.entity.{js,ts}')],
      synchronize: JSON.parse(process.env.DB_SYNC),
      logging: JSON.parse(process.env.DB_LOGGING),
      // charset: 'utf8mb4_unicode_ci'
      options: connectOption,
    }
  : {};

export default (): TypeOrmModuleOptions => connectionConfig;
