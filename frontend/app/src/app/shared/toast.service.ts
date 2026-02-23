import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export type ToastMessage = {
  type: ToastType;
  text: string;
  id: number;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new Subject<ToastMessage>();
  toasts$ = this._toasts$.asObservable();

  private id = 0;

  success(text: string) {
    this._toasts$.next({ type: 'success', text, id: ++this.id });
  }

  error(text: string) {
    this._toasts$.next({ type: 'error', text, id: ++this.id });
  }

  info(text: string) {
    this._toasts$.next({ type: 'info', text, id: ++this.id });
  }
}
