import { HttpException, HttpStatus } from '@nestjs/common';
import { GenericErrorException } from 'src/common/exceptions/generic-error.exception';
import { SysCode } from 'src/common/enum/sys-code.enum';
import { ValidationOptions, ValidateBy, buildMessage } from 'class-validator';

const isDateFormatValid = (date: any): any => {
  // 忽略null/ undefined/ ''
  if (!date) {
    return true;
  }
  date = date.trim();

  // YYYY/MM/DD HH:MM:SS格式
  const reg = /^\d{4}\/\d{2}\/\d{2}( \d{2}:\d{2}:\d{2})?$/;

  // isNaN 只接受 number type
  const isDateValid = (date: Date): boolean =>
    date instanceof Date && !isNaN(date as any);

  // 格式檢查
  if (!reg.test(date)) {
    // throw error
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        message: ['日期格式錯誤'],
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  // 嘗試轉為 js 物件
  const isValid = isDateValid(new Date(date));
  if (!isValid) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        message: ['日期格式轉換發生錯誤'],
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  return date;
};

export function DateFormatCheck(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'dateFormatCheck',
      validator: {
        validate: (value: string): boolean => isDateFormatValid(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '日期格式錯誤，應為YYYY/MM/DD HH/MM/SS',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
