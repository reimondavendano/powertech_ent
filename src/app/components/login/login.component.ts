import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  loginError = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async onLogin() {
    this.isLoading = true;
    this.loginError = '';

    try {
      const { data, error } = await this.supabaseService.signIn(this.credentials.email, this.credentials.password);

      if (error) {
        this.loginError = error.message || 'An unknown error occurred during login.';
        console.error('Login error:', error);
      } else if (data?.user) {
        // Upon successful login, you would typically fetch the user's profile
        // from your 'profiles' table to check their role (e.g., 'admin').
        // For this example, we'll navigate to '/admin' directly after successful auth.
        // In a real application, you'd add logic here to verify the user's role.
        this.router.navigate(['/admin']);
      } else {
        this.loginError = 'Invalid credentials. Please check your email and password.';
      }
    } catch (error) {
      this.loginError = 'An unexpected error occurred during login. Please try again.';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
