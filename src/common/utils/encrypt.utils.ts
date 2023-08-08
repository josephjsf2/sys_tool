import { Logger } from './logger';
import winston from 'winston';
import * as CryptoJS from 'crypto-js';

export class EncryptUtils {
  private static readonly AES_PSD = 'WNQfVLWNxtNnsmkGjkXP8LGyyXaFrBnx';
  private static readonly logger: winston.Logger = Logger.createLogger(
    EncryptUtils.name,
  );

  static aesEncrypt(plainText: string): string {
    try {
      return CryptoJS.AES.encrypt(plainText, EncryptUtils.AES_PSD).toString();
    } catch (error) {
      EncryptUtils.logger.error('AESEncrypt error. ');
      EncryptUtils.logger.error(error);
    }
    return '';
  }

  static aesDecrypt(encryptText: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptText, EncryptUtils.AES_PSD);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      EncryptUtils.logger.error('AESDecrypt error. ');
      EncryptUtils.logger.error(error);
    }
    return '';
  }

  /**
   *
   * @param message base64 format
   * @param key
   * @param mode
   * @param padding
   * @returns
   */
  static desDecrypt(
    message: string,
    key: string,
    mode = CryptoJS.mode.ECB,
    padding = CryptoJS.pad.Pkcs7,
  ): string {
    // 如果是 hex格式，需要額外轉換cryptoJs.enc.Hex.parse(message)
    const decData = (message as any).toString(CryptoJS.enc.Utf8);
    const keyHex = CryptoJS.enc.Utf8.parse(key);
    const plain = CryptoJS.DES.decrypt(decData, keyHex, {
      mode,
      padding,
    }).toString(CryptoJS.enc.Utf8);
    return plain;
  }

  static encryptDes(
    message,
    key,
    mode = CryptoJS.mode.ECB,
    padding = CryptoJS.pad.ZeroPadding,
  ) {
    const keyHex = CryptoJS.enc.Utf8.parse(key);
    const option = { mode, padding };
    // 如果要輸出hex格式，則使用encrypted.ciphertext.toString()
    const encrypted = CryptoJS.DES.encrypt(message, keyHex, option);
    return encrypted.toString();
  }
}
