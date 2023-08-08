import { EncryptUtils } from './../../common/utils/encrypt.utils';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebUtils } from 'src/common/utils/web.utils';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import winston from 'winston';
import { Logger } from 'src/common/utils/logger';

@Injectable()
export class RestService {
  proxy: any;
  logger: winston.Logger = Logger.createLogger(
    RestService.name,
    './logs/rest',
    'rest',
  );

  constructor(private http: HttpService, private configService: ConfigService) {
    if (this.configService.get('proxyHost')) {
      this.proxy = {
        protocol: this.configService.get('proxyProtocol'),
        host: this.configService.get('proxyHost'),
        port: this.configService.get('proxyPort'),
        auth: {
          username: this.configService.get('proxyAuthName'),
          password: this.configService.get('proxyAuthPsd'),
        },
      };
      this.logger.info(
        `Using proxy: ${this.proxy.protocol}://${this.proxy.host}:${this.proxy.port}`,
      );
    }
  }

  httpGet<T>(
    url: string,
    queryParam?: any,
    config?: AxiosRequestConfig,
  ): Observable<T> {
    if (config && this.proxy) {
      config.proxy = this.getProxyConfig(url);
    }

    return this.http
      .get<T>(
        url,
        config || {
          headers: this.getRequestHeaders(),
          params: this.getRequestParams(queryParam),
          proxy: this.getProxyConfig(url),
        },
      )
      .pipe(map((response) => response.data));
  }

  httpPut<T>(
    url: string,
    payload?: any,
    contentType?: any,
    config?: AxiosRequestConfig,
  ): Observable<any> {
    if (!contentType) {
      contentType = 'application/json';
    }
    if (config && this.proxy) {
      config.proxy = this.getProxyConfig(url);
    }
    return this.http
      .put(
        url,
        this.getRequestPayload(WebUtils.trimForAttrs(payload), contentType),
        config || {
          headers: this.getRequestHeaders(contentType),
          proxy: this.getProxyConfig(url),
        },
      )
      .pipe(map((response) => response.data));
  }

  httpPost<T>(
    url: string,
    payload: any,
    contentType?: any,
    config?: AxiosRequestConfig,
  ): Observable<T> {
    if (!contentType) {
      contentType = 'application/json';
    }
    if (config && this.proxy) {
      config.proxy = this.getProxyConfig(url);
    }
    return this.http
      .post<T>(
        url,
        this.getRequestPayload(WebUtils.trimForAttrs(payload), contentType),
        config || {
          headers: this.getRequestHeaders(contentType),
          proxy: this.getProxyConfig(url),
        },
      )
      .pipe(map((response) => response.data));
  }

  httpDelete<T>(url: string, config?: AxiosRequestConfig): Observable<any> {
    if (config && this.proxy) {
      config.proxy = this.getProxyConfig(url);
    }
    return this.http
      .delete<T>(
        url,
        config || {
          headers: { ...this.getRequestHeaders() },
          proxy: this.getProxyConfig(url),
        },
      )
      .pipe(map((response) => response.data));
  }

  httpPostFile<T>(url: string, fd: FormData): Observable<any> {
    return this.http.post(url, fd);
  }

  httpPatch<T>(
    url: string,
    payload?: any,
    contentType?: any,
    config?: AxiosRequestConfig,
  ) {
    if (config && this.proxy) {
      config.proxy = this.getProxyConfig(url);
    }
    return this.http
      .patch(
        url,
        payload,
        config || {
          headers: this.getRequestHeaders(contentType),
          proxy: this.getProxyConfig(url),
        },
      )
      .pipe(map((response) => response.data));
  }

  /**
   * 預設Content-Type為application/json
   * @param contentType 資料格式
   */
  getRequestHeaders(contentType?: string): any {
    return {
      'Content-Type': contentType || 'application/json',
    };
  }

  private getRequestPayload(
    payload: any,
    contentType = 'application/json',
  ): any {
    switch (contentType) {
      case 'application/json':
        return payload;
      case 'application/x-www-form-urlencoded':
        return this.getRequestParams(payload);
    }
    return payload;
  }

  private getRequestParams(payload: any): URLSearchParams {
    if (!payload) {
      return payload;
    }
    const params = new URLSearchParams();
    for (const key of Object.keys(payload)) {
      params.set(key, payload[key]);
    }
    return params;
  }

  private getProxyConfig(url: string) {
    if (url && url.startsWith(this.configService.get('backendUrl'))) {
      return false;
    }
    return this.proxy;
  }
}
