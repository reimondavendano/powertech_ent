import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common'; // Import CommonModule
// If you use any Angular Forms features (like ngModel), you would import FormsModule here as well.

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule], // Include CommonModule and RouterModule here
  templateUrl: './header.component.html', // Point to external HTML file
  styleUrls: ['./header.component.css'] // Point to external CSS file
})


export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  mobileMenuOpen = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabaseService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  async logout() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}