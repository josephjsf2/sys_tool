import { Pager } from './pager.model';

export class QueryOption {
  queryString?: string;
  pagerString?: string;

  constructor(queryObject?: any, pager?: Pager<any>, options?: any) {
    this.queryString = queryObject ? JSON.stringify(queryObject) : null;
    this.pagerString = pager ? JSON.stringify(pager) : null;

    if (options) {
      // Append options value to this object
      for (const key of Object.keys(options)) {
        if (options[key]) {
          this[key] = options[key];
        }
      }
    }
  }
}
