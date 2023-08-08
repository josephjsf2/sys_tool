import { HttpException } from '@nestjs/common';
import { SysResponseMsg } from 'src/common/models/sys-response-msg.model';

export class GenericErrorException extends HttpException {
  errCode: string;

  constructor(errCode: string, msg?: string) {
    const respCode = new SysResponseMsg(errCode, msg || '未知錯誤');
    super(respCode, 200);
    this.errCode = errCode;
  }
}
