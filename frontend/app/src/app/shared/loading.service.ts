import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private _loading$ = new BehaviorSubject<boolean>(false);

  loading$ = this._loading$.asObservable();

  start() {
    this.count++;
    this._loading$.next(true);
  }

  stop() {
    this.count = Math.max(0, this.count - 1);
    this._loading$.next(this.count > 0);
  }
}
