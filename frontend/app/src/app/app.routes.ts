import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ProductsListComponent } from './pages/products/products-list.component';
import { LayoutComponent } from './layout/layout';   
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [authGuard],   // protects /products and future children
    children: [
      { path: 'products', component: ProductsListComponent },
      { path: '', redirectTo: 'products', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];