import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product } from '../../services/supabase.service';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './products.component.html', // Point to external HTML file
  styleUrls: ['./products.component.css'] // Point to external CSS file
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  sortBy: string = 'name';
  loading: boolean = true;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    this.loading = true;
    const { data, error } = await this.supabaseService.getProducts();
    
    if (data && !error) {
      this.products = data;
      this.filteredProducts = [...this.products];
      this.extractCategories();
      this.sortProducts();
    } else {
      console.error('Error loading products:', error);
    }
    
    this.loading = false;
  }

  extractCategories() {
    const categorySet = new Set(this.products.map(p => p.category));
    this.categories = Array.from(categorySet).sort();
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || 
        product.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
    
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
    }
  }

  inquireProduct(product: Product) {
    // Navigate to inquiry page with product context
    window.location.href = `/inquiry?product=${product.id}&name=${encodeURIComponent(product.name)}`;
  }
}
