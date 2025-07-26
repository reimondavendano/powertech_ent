import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService, Product } from '../../services/supabase.service';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  currentSlideIndex: number = 0; // Tracks the current starting index for the slider
  itemsPerSlide: number = 4; // Changed back to 4 products per slide

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadFeaturedProducts();
  }

  async loadFeaturedProducts() {
    const { data, error } = await this.supabaseService.getProducts();
    if (data && !error) {
      // Ensure we have enough products to show, otherwise display what's available
      this.featuredProducts = data;
    }
  }

  // Calculates the total number of "slides" or pages
  get totalSlides(): number {
    return Math.ceil(this.featuredProducts.length / this.itemsPerSlide);
  }

  // Returns the products for the current slide
  get currentSlideProducts(): Product[] {
    const startIndex = this.currentSlideIndex * this.itemsPerSlide;
    const endIndex = startIndex + this.itemsPerSlide;
    return this.featuredProducts.slice(startIndex, endIndex);
  }

  // Navigates to the next slide
  nextSlide() {
    if (this.currentSlideIndex < this.totalSlides - 1) {
      this.currentSlideIndex++;
    } else {
      // Loop back to the first slide if at the end
      this.currentSlideIndex = 0;
    }
  }

  // Navigates to the previous slide
  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else {
      // Loop to the last slide if at the beginning
      this.currentSlideIndex = this.totalSlides - 1;
    }
  }

  // TrackBy function for *ngFor to optimize rendering
  trackByProductId(index: number, product: Product): string | undefined {
    return product.id; // Return the unique ID of the product
  }

  openInquiry(product: Product) {
    // Navigate to inquiry page with product context
    window.location.href = `/inquiry?product=${product.id}`;
  }
}
