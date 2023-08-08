import { Observable } from 'rxjs';
import { HyRepository } from './hy-repository.interface';

export abstract class HyBaseRepository<T> implements HyRepository<T> {
  abstract listObjects(payload?: T): Observable<T[]>;
  abstract addObject(payload: T): Observable<T>;
  abstract updateObject(id: string, payload: T): Observable<any>;
  abstract deleteObject(id: string): Observable<any>;
}
