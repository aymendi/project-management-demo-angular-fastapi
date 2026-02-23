import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-3 right-3 z-[9999] space-y-2 w-[320px] max-w-[90vw]">
      <div
        *ngFor="let t of toasts"
        class="rounded-lg px-4 py-3 shadow-lg border text-sm flex items-start justify-between gap-3"
        [ngClass]="{
          'bg-white border-zinc-200 text-zinc-900': t.type === 'info',
          'bg-green-50 border-green-200 text-green-900': t.type === 'success',
          'bg-red-50 border-red-200 text-red-900': t.type === 'error'
        }"
      >
        <div class="leading-snug">
          <div class="font-semibold" *ngIf="t.type === 'error'">Error</div>
          <div class="font-semibold" *ngIf="t.type === 'success'">Success</div>
          <div class="font-semibold" *ngIf="t.type === 'info'">Info</div>
          <div>{{ t.text }}</div>
        </div>

        <button
          class="text-xs opacity-70 hover:opacity-100"
          (click)="remove(t.id)"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  `,
})
export class ToastComponent {
  private toastService = inject(ToastService);

  toasts: ToastMessage[] = [];

  constructor() {
    this.toastService.toasts$.subscribe((t) => {
      this.toasts = [t, ...this.toasts].slice(0, 3); // max 3 toasts
      setTimeout(() => this.remove(t.id), 3000); // auto-close 3s
    });
  }

  remove(id: number) {
    this.toasts = this.toasts.filter((x) => x.id !== id);
  }
}
