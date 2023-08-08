import { WebUtils } from './../utils/web.utils';
import { PipeTransform } from '@nestjs/common';

export class TrimPipe implements PipeTransform {
  transform(obj: any): any {
    if (!obj) {
      return obj;
    }

    if (typeof obj === 'string') {
      return obj.trim();
    } else if (typeof obj === 'object') {
      return WebUtils.trimForAttrs(obj);
    }
    return obj;
  }
}
