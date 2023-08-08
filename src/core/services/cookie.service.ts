import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

@Injectable()
export class CookieService {
  defaultOption = { httpOnly: true, secure: true };

  addCookie(
    resp: Response,
    key: string,
    value: string,
    options?: { [key: string]: any },
  ): void {
    const cookieOptions = options || this.defaultOption;
    resp.cookie(key, value, cookieOptions);
  }

  getCookie(req: Request, key: string): string {
    return req.cookies?.[key];
  }

  removeCookie(resp: Response, key: string): void {
    resp.clearCookie(key);
  }
}
