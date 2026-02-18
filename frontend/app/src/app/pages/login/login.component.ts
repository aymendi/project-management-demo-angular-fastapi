import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';


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
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // ✅ show validation immediately
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.form.getRawValue();
    const username = (raw.username ?? '').trim();
    const password = raw.password ?? '';

    this.apollo
      .mutate({
        mutation: LOGIN_MUTATION,
        variables: { username, password },
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          const token = res?.data?.login?.token;
          const role = res?.data?.login?.user?.role;

          if (!token) {
            this.error = 'Login failed';
            return;
          }

          // ✅ store token
          this.tokenService.setToken(token);

          // ✅ store role for RBAC (ADMIN/USER)
          if (role) localStorage.setItem('role', role);

          this.router.navigateByUrl('/products');
        },
        error: (err) => {
          this.loading = false;

          // ✅ best error extraction for GraphQL
          const gqlMsg =
            err?.graphQLErrors?.[0]?.message ||
            err?.networkError?.message ||
            err?.message;

          this.error = gqlMsg || 'Invalid credentials or server unreachable';
        },
      });
  }
}
