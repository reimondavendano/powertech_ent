import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component.js';
import { ProductsComponent } from './components/products/products.component.js';
import { InquiryComponent } from './components/inquiry/inquiry.component.js';
import { LoginComponent } from './components/login/login.component.js';
import { AdminComponent } from './components/admin/admin.component.js';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'inquiry', component: InquiryComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];