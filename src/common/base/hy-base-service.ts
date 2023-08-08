import { Observable, of } from 'rxjs';
import { HyBaseRepository } from './hy-base-repository';
import { HyService } from './hy-service.interface';

export abstract class HyBaseService<T> implements HyService<T> {
  dataSource: HyBaseRepository<T>;
  constructor(dataSource: HyBaseRepository<T>) {
    this.dataSource = dataSource;
  }

  listObjects(payload?: T): Observable<T[]> {
    return this.dataSource.listObjects(payload);
  }

  addObject(payload: T): Observable<T> {
    return this.dataSource.addObject(payload);
  }
  updateObject(id: string, payload: T): Observable<any> {
    return this.dataSource.updateObject(id, payload);
  }
  deleteObject(id: any): Observable<any> {
    return this.dataSource.deleteObject(id);
  }
}
