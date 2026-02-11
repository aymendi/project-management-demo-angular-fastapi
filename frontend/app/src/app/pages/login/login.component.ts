import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { AuthTokenService } from '../../auth-token.service';
import { CommonModule } from '@angular/common';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user { id username role }
    }
  }
`;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-bold">Login</h1>
      <p class="text-sm text-gray-500 mb-6">Connecte-toi pour accéder aux produits.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Username</label>
          <input
            class="w-full rounded-lg border p-2 outline-none focus:ring"
            formControlName="username"
            placeholder="ex: aymen"
          />
          <p class="mt-1 text-xs text-red-600"
             *ngIf="form.controls.username.touched && form.controls.username.invalid">
            Username obligatoire
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            class="w-full rounded-lg border p-2 outline-none focus:ring"
            formControlName="password"
            placeholder="••••••"
          />
          <p class="mt-1 text-xs text-red-600"
             *ngIf="form.controls.password.touched && form.controls.password.invalid">
            Password obligatoire
          </p>
        </div>

        <button
          class="w-full rounded-lg bg-black text-white p-2 font-semibold disabled:opacity-50"
          type="submit"
          [disabled]="form.invalid || loading"
        >
          {{ loading ? 'Connexion...' : 'Login' }}
        </button>

        <p class="text-sm text-red-600" *ngIf="error">{{ error }}</p>
      </form>
    </div>
  </div>
`,

})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private tokenService = inject(AuthTokenService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const { username, password } = this.form.getRawValue();

    this.apollo
      .mutate({
        mutation: LOGIN_MUTATION,
        variables: { username, password },
      })
      .subscribe({
        next: (res) => {
          this.loading = false;

          const data: any = res.data;
          const token = data?.login?.token;

          if (!token) {
            this.error = 'Login failed';
            return;
          }

          this.tokenService.setToken(token);
          this.router.navigateByUrl('/products');
        },
        error: () => {
          this.loading = false;
          this.error = 'Invalid credentials or server unreachable';
        },
      });
  }
}
