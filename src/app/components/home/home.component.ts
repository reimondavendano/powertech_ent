// src/app/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Ensure RouterModule is imported for routerLink
import { SupabaseService, Product } from '../../services/supabase.service';
import { HeaderComponent } from "../header/header.component"; // Adjust path if needed

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  newArrivals: Product[] = []; // Added for new arrivals section
  topSellers: Product[] = []; // Added for top sellers section

  currentSlideIndex: number = 0; // Tracks the current starting index for the slider
  itemsPerSlide: number = 4; // Number of products per slide

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadAllProducts(); // Load all product data
  }

  async loadAllProducts() {
    const { data, error } = await this.supabaseService.getProducts();
    if (data && !error) {
      // Assuming 'created_at' for new arrivals and 'sales_count' for top sellers
      // You might need to adjust this logic based on how you define these categories

      // All products can be featured
      this.featuredProducts = data;

      // New Arrivals: Sort by created_at (descending) and take a few
      this.newArrivals = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

      // Top Sellers: Sort by sales_count (descending) and take a few
      this.topSellers = [...data].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 6);

    } else if (error) {
      console.error('Error loading products:', error);
      // Handle error, e.g., show a message to the user
    }
  }

  // Calculates the total number of "slides" or pages for featured products
  get totalSlides(): number {
    // Ensure we don't divide by zero if itemsPerSlide is 0
    return this.itemsPerSlide > 0 ? Math.ceil(this.featuredProducts.length / this.itemsPerSlide) : 0;
  }

  // Navigates to the next slide for featured products
  nextSlide() {
    if (this.currentSlideIndex < this.totalSlides - 1) {
      this.currentSlideIndex++;
    } else {
      // Loop back to the first slide if at the end
      this.currentSlideIndex = 0;
    }
  }

  // Navigates to the previous slide for featured products
  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else {
      // Loop to the last slide if at the beginning
      this.currentSlideIndex = this.totalSlides - 1;
    }
  }

  // TrackBy function for *ngFor to optimize rendering
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  // Method to handle "Inquire Now" button click
  openInquiry(product: Product) {
    // You can implement actual inquiry form opening or navigation here
    console.log(`Inquiring about: ${product.name} (ID: ${product.id})`);
    // Example: Navigate to an inquiry page with product ID as a query parameter
    window.location.href = `/inquiry?product=${product.id}`;
  }
}