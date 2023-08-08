import dayjs = require('dayjs');
export class DateUtils {
  /**
   * UTC 時間轉為 locale 時間格式
   */
  static formatDisplayDate(
    list: any[],
    attrs: string[],
    format = 'YYYY/MM/DD HH:mm:ss',
  ): any[] {
    return list.map((item) => {
      for (const attr of attrs) {
        item[attr] = dayjs(item[attr]).format(format);
      }
      return item;
    });
  }

  static formatDate(date: Date): string {
    const format = 'YYYY/MM/DD HH:mm:ss:SSS';
    return dayjs(date).format(format);
  }

  static stringToDate(date: string): Date {
    return dayjs(date.replace('/', '-')).toDate();
  }
}
