// src/app/products/products.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService, Product } from '../../services/supabase.service';
import { HeaderComponent } from "../header/header.component.js";

// Ensure your Product interface in '../../services/supabase.service' includes these properties if you want to use them from Supabase.
// Example in supabase.service.ts (not this file):
/*
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  // Add these if they are in your Supabase table and you want to fetch them
  originalPrice?: number;
  sales_count?: number;
  brand?: string;
  // rating?: number; // Removed as per request
}
*/

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Filter properties
  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStock: boolean = false; // For Availability: In Stock
  selectedBrands: string[] = [];
  availableBrands: string[] = []; // Populated from product data
  selectedDiscount: number | null = null; // e.g., 0.10 for 10% off
  discountOptions: { label: string, value: number | null }[] = [
    { label: 'All Discounts', value: null },
    { label: '10% or more', value: 0.10 },
    { label: '20% or more', value: 0.20 },
    { label: '30% or more', value: 0.30 }
  ];

  sortBy: string = 'name'; // Default sort option
  loading: boolean = true;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    this.loading = true;
    const { data, error } = await this.supabaseService.getProducts();

    if (data && !error) {
      // Assuming originalPrice, sales_count, and brand come directly from Supabase now.
      // Removed the mocking logic for these properties.
      this.products = data;

      this.extractBrands(); // Extract brands from loaded products
      this.applyFiltersAndSort(); // Apply initial filters and sorting
    } else {
      console.error('Error loading products:', error);
    }

    this.loading = false;
  }

  extractBrands() {
    const brandSet = new Set(this.products.map(p => p.brand).filter(Boolean) as string[]);
    this.availableBrands = Array.from(brandSet).sort();
  }

  // Unified method to apply all filters and then sort
  applyFiltersAndSort() {
    let tempProducts = [...this.products];

    // Search Term Filter
    if (this.searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    // Price Range Filter
    if (this.minPrice !== null) {
      tempProducts = tempProducts.filter(product => product.price >= this.minPrice!);
    }
    if (this.maxPrice !== null) {
      tempProducts = tempProducts.filter(product => product.price <= this.maxPrice!);
    }

    // Availability Filter (In Stock)
    if (this.inStock) {
      tempProducts = tempProducts.filter(product => (product.stock || 0) > 0);
    }

    // Brand Filter
    if (this.selectedBrands.length > 0) {
      tempProducts = tempProducts.filter(product =>
        product.brand && this.selectedBrands.includes(product.brand)
      );
    }

    // Discount Filter
    if (this.selectedDiscount !== null) {
      tempProducts = tempProducts.filter(product => {
        // Ensure originalPrice exists and is greater than price for discount calculation
        if (product.originalPrice && product.originalPrice > product.price) {
          const discount = (product.originalPrice - product.price) / product.originalPrice;
          return discount >= this.selectedDiscount!;
        }
        return false;
      });
    }

    // Rating Filter removed as per request.

    this.filteredProducts = tempProducts;
    this.sortProducts(); // Always re-sort after filtering
  }

  sortProducts() {
    switch (this.sortBy) {
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'stock':
        this.filteredProducts.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-desc':
        this.filteredProducts.sort((a, b) => b.stock - a.stock);
        break;
      case 'bestselling': // Added for image reference
        // Assuming sales_count now comes from Supabase. Handle potential undefined.
        this.filteredProducts.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
    }
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  inquireProduct(product: Product) {
    // Navigate to inquiry page with product context
    this.router.navigate(['/inquiry'], { queryParams: { product: product.id, name: product.name } });
  }

  addToCart(product: Product) {
    console.log(`Added ${product.name} to cart!`);
    // Implement your cart logic here (e.g., add to a cart service)
  }

  // Helper getters for counts in the template
  get inStockCount(): number {
    return this.products.filter(p => (p.stock || 0) > 0).length;
  }

  getBrandCount(brand: string): number {
    // Assuming brand property now comes from Supabase. Handle potential undefined.
    return this.products.filter(p => p.brand === brand).length;
  }

}