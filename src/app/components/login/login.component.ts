import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html', // Point to external HTML file
  styleUrls: ['./login.component.css'] // Point to external CSS file
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
      // For demo purposes, allow demo credentials
      if (this.credentials.email === 'adminpowertech.com' && this.credentials.password === 'admin123') {
        // Simulate successful login for demo
        this.router.navigate(['/admin']);
        return;
      }

      // Mock authentication - for demo purposes only
      this.loginError = 'Invalid credentials. Please use the demo credentials provided.';
    } catch (error) {
      this.loginError = 'An error occurred during login. Please try again.';
      console.error('Login error:', error);
    }

    this.isLoading = false;
  }
}
