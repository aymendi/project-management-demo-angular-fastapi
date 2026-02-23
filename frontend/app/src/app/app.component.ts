import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { LoadingService } from './shared/loading.service';
import { ToastComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, AsyncPipe, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  loading$ = inject(LoadingService).loading$;
}
