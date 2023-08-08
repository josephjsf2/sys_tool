export class Pager<T> {
  currentPage?: number;
  pageSize?: number;
  maxPage?: number;
  totalCount?: number;
  resultList?: T[];
  sortColumnName?: string;

  constructor(pageSize = 20) {
    this.pageSize = pageSize;
  }
}
