// src/app/components/product-detail/product-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService, Product } from '../../services/supabase.service';
import { HeaderComponent } from '../header/header.component'; // Adjust path if needed

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent], // Include HeaderComponent
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.loadProductDetails();
  }

  async loadProductDetails(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    const productId = this.route.snapshot.paramMap.get('id'); // Get ID from URL

    if (productId) {
      const { data, error } = await this.supabaseService.getProductById(parseInt(productId, 10));
      if (data) {
        this.product = data;
      } else if (error) {
        console.error('Error loading product details:', error);
        this.errorMessage = 'Could not load product details. Please try again.';
      }
    } else {
      this.errorMessage = 'Product ID not found in URL.';
    }
    this.isLoading = false;
  }

  get saveAmount(): number | null {
    if (this.product?.originalPrice && this.product.originalPrice > this.product.price) {
      return this.product.originalPrice - this.product.price;
    }
    return null;
  }

  // Placeholder for inquiry logic, similar to homepage
  openInquiry() {
    if (this.product) {
      window.location.href = `/inquiry?product=${this.product.id}`;
    }
  }

  // Placeholder for "Add to cart" logic
  addToCart() {
    alert(`Added ${this.product?.name} to cart! (Functionality not yet implemented)`);
  }

  // Placeholder for "Add to wishlist" logic
  addToWishlist() {
    alert(`Added ${this.product?.name} to wishlist! (Functionality not yet implemented)`);
  }

  // Placeholder for "Compare" logic
  compareProduct() {
    alert(`Comparing ${this.product?.name}! (Functionality not yet implemented)`);
  }
}