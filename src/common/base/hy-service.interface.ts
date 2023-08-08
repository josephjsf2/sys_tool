import { Observable } from 'rxjs';

export interface HyService<T> {
  listObjects(payload?: T): Observable<T[]>;

  addObject(payload: T): Observable<T>;

  updateObject(id: string, payload: T): Observable<any>;

  deleteObject(id: string): Observable<any>;
}
