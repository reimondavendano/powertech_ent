// src/app/products/products.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router'; // Import ActivatedRoute
import { SupabaseService, Product, Category } from '../../services/supabase.service'; // Import Category

import { HeaderComponent } from "../header/header.component";

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
  inStock: boolean = false;
  selectedBrands: string[] = [];
  availableBrands: string[] = [];
  selectedDiscount: number | null = null;
  discountOptions: { label: string, value: number | null }[] = [
    { label: 'All Discounts', value: null },
    { label: '10% or more', value: 0.10 },
    { label: '20% or more', value: 0.20 },
    { label: '30% or more', value: 0.30 }
  ];

  sortBy: string = 'name';
  loading: boolean = true;

  // Category filtering properties
  categories: Category[] = []; // All available categories
  categoryMap: Map<number, string> = new Map(); // Map for quick lookup
  selectedCategory: number | null = null; // The ID of the currently selected category filter

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}

  async ngOnInit() {
    await this.loadCategories(); // Load categories first
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        const categoryId = parseInt(params['category'], 10);
        if (!isNaN(categoryId)) {
          this.selectedCategory = categoryId;
        }
      }
      this.loadProducts(); // Load products and apply filters based on initial query params
    });
  }

  async loadCategories() {
    const { data, error } = await this.supabaseService.getCategories();
    if (data && !error) {
      this.categories = data;
      this.categories.forEach(category => {
        this.categoryMap.set(category.id, category.name);
      });
    } else {
      console.error('Error loading categories:', error);
    }
  }

  getCategoryName(categoryId: number): string {
    return this.categoryMap.get(categoryId) || 'Unknown Category';
  }

  async loadProducts() {
    this.loading = true;
    const { data, error } = await this.supabaseService.getProducts();

    if (data && !error) {
      this.products = data;
      this.extractBrands();
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

  applyFiltersAndSort() {
    let tempProducts = [...this.products];

    // Category Filter (NEW)
    if (this.selectedCategory !== null && this.selectedCategory !== 0) { // 0 can be used for 'All Categories'
      tempProducts = tempProducts.filter(product => product.category_id === this.selectedCategory);
    }

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
        if (product.originalPrice && product.originalPrice > product.price) {
          const discount = (product.originalPrice - product.price) / product.originalPrice;
          return discount >= this.selectedDiscount!;
        }
        return false;
      });
    }

    this.filteredProducts = tempProducts;
    this.sortProducts();
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
      case 'bestselling':
        this.filteredProducts.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
    }
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  inquireProduct(product: Product) {
    this.router.navigate(['/inquiry'], { queryParams: { product: product.id, name: product.name } });
  }

  addToCart(product: Product) {
    console.log(`Added ${product.name} to cart!`);
  }

  get inStockCount(): number {
    return this.products.filter(p => (p.stock || 0) > 0).length;
  }

  getBrandCount(brand: string): number {
    return this.products.filter(p => p.brand === brand).length;
  }
}
