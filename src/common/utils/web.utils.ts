import {
  delayWhen,
  iif,
  Observable,
  of,
  retryWhen,
  Subject,
  switchMap,
  take,
  tap,
  throwError,
  timer,
} from 'rxjs';
import winston from 'winston/lib/winston/config';

export class WebUtils {
  /**
   * 除去字串前後空白
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static trimForAttrs(obj: any): any {
    if (!obj) {
      return obj;
    }

    if (typeof obj === 'string') {
      return obj.trim();
    }

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
      if (typeof obj[keys[i]] === 'string') {
        obj[keys[i]] = obj[keys[i]].trim();
      }
    }

    return obj;
  }

  static delay(delayInMs: number) {
    return new Promise((resolve) => setTimeout(resolve, delayInMs));
  }

  /**
   * 比較出差異內容
   * @return
   *  commonItems: T[][]: [src1, src2] => 相同之項目; src1MissingItems: T[] src2擁有但src1 => 沒有之項目;
   *  src2MissingItems: T{} src1 擁有但src2 => 沒有之項目;
   *
   */
  static compareDiff<T>(src1: T[], src2: T[], key: string) {
    const keyMap1 = WebUtils.generateMap(key, src1); // 建立 src1Map
    const keyMap2 = WebUtils.generateMap(key, src2); // 建立 src2Map
    const commonItems: T[][] = []; // 共同用有之內容(要更新之內容)
    const src1MissingItems: T[] = []; // src1 缺少之內容(要新增之內容)
    const src2MissingItems: T[] = []; // src2 缺少之內容(要刪除之內容)

    for (const key of keyMap1.keys()) {
      if (keyMap2.has(key)) {
        // 共同擁有
        commonItems.push([keyMap1.get(key), keyMap2.get(key)]);
        keyMap1.delete(key);
        keyMap2.delete(key);
      } else {
        // src2 缺少之內容
        src2MissingItems.push(keyMap1.get(key));
        keyMap1.delete(key);
      }
    }
    // src1 缺少之內容
    for (const key of keyMap2.keys()) {
      src1MissingItems.push(keyMap2.get(key));
    }

    return { commonItems, src1MissingItems, src2MissingItems };
  }

  static generateMap<T>(key: string, src: T[]): Map<string, T> {
    const map = new Map<string, T>();
    for (const item of src) {
      const mapKey =
        typeof item[key] === 'string' ? item[key].trim() : item[key];
      map.set(mapKey, item);
    }
    return map;
  }

  static removeEmpty<T>(data: T): T {
    if (typeof data !== 'object') {
      return data;
    }
    for (const key of Object.keys(data)) {
      if (!!data[key]) {
        delete data[key];
      }
    }
    return data;
  }

  /**
   * Observable 加入 retry
   * @param src$
   * @param delayInMillis
   * @param count
   * @returns
   */
  static wrapObservableWithRetry(
    src$: Observable<any>,
    delayInMillis: number,
    count: number,
    errCallback?: (err) => any,
  ): Observable<any> {
    let currCnt = 0;

    return src$.pipe(
      retryWhen((err: Observable<any>) =>
        err.pipe(
          tap((err) =>
            errCallback(`Failed with error code [ ${err?.response?.status}].`),
          ),
          tap((err) => errCallback(err?.response?.data)),
          switchMap((errResp) =>
            iif(
              () => currCnt === count,
              throwError(() => errResp),
              of(err).pipe(
                tap((_) => currCnt++),
                delayWhen(() => timer(delayInMillis)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
