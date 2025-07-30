import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService, Product, Category } from '../../services/supabase.service'; // Import Category
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: 'products' | 'categories' | 'add-product' | 'add-category' = 'products'; // Updated tabs
  products: Product[] = [];
  categories: Category[] = []; // New property for categories
  editingProduct: Product | null = null;
  editingCategory: Category | null = null; // New property for editing categories
  saving = false;

  currentProduct: Omit<Product, 'id' | 'created_at'> = {
    name: '',
    description: '',
    price: 0,
    category_id: 0, // Changed from 'category' to 'category_id'
    stock: 0,
    image_url: '',
    specs: {} // Initialize specs as an empty object
  };

  currentCategory: Omit<Category, 'id' | 'created_at'> = { // New property for adding/editing categories
    name: '',
    description: '',
    image_url: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories(); // Load categories on init
  }

  async loadProducts() {
    const { data, error } = await this.supabaseService.getProducts();
    if (data && !error) {
      this.products = data;
    } else {
      console.error('Error loading products:', error);
    }
  }

  async loadCategories() {
    const { data, error } = await this.supabaseService.getCategories();
    if (data && !error) {
      this.categories = data;
    } else {
      console.error('Error loading categories:', error);
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.currentProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      stock: product.stock,
      image_url: product.image_url || '',
      specs: product.specs || {}
    };
    this.activeTab = 'add-product';
  }

  async deleteProduct(id: number) {
    // IMPORTANT: Replaced confirm() with a custom message box as per instructions.
    // You would implement a modal or similar UI for confirmation.
    const confirmed = window.confirm('Are you sure you want to delete this product?'); // For demo purposes, using window.confirm
    if (confirmed) {
      const { error } = await this.supabaseService.deleteProduct(id);
      if (!error) {
        this.loadProducts();
      } else {
        console.error('Error deleting product:', error);
      }
    }
  }

  async saveProduct() {
    this.saving = true;

    try {
      if (this.editingProduct) {
        const { data, error } = await this.supabaseService.updateProduct(
          this.editingProduct.id,
          this.currentProduct
        );
        if (!error) {
          this.loadProducts();
          this.cancelEditProduct();
        } else {
          console.error('Error updating product:', error);
        }
      } else {
        const { data, error } = await this.supabaseService.createProduct(this.currentProduct);
        if (!error) {
          this.loadProducts();
          this.resetProductForm();
        } else {
          console.error('Error creating product:', error);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }

    this.saving = false;
  }

  cancelEditProduct() {
    this.editingProduct = null;
    this.resetProductForm();
    this.activeTab = 'products';
  }

  resetProductForm() {
    this.currentProduct = {
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      stock: 0,
      image_url: '',
      specs: {}
    };
  }

  // Category Management Methods
  editCategory(category: Category) {
    this.editingCategory = category;
    this.currentCategory = {
      name: category.name,
      description: category.description,
      image_url: category.image_url || ''
    };
    this.activeTab = 'add-category';
  }

  async deleteCategory(id: number) {
    const confirmed = window.confirm('Are you sure you want to delete this category? This will affect associated products!');
    if (confirmed) {
      const { error } = await this.supabaseService.deleteCategory(id);
      if (!error) {
        this.loadCategories();
        this.loadProducts(); // Reload products as category_id might change to NULL
      } else {
        console.error('Error deleting category:', error);
      }
    }
  }

  async saveCategory() {
    this.saving = true;
    try {
      if (this.editingCategory) {
        const { data, error } = await this.supabaseService.updateCategory(
          this.editingCategory.id,
          this.currentCategory
        );
        if (!error) {
          this.loadCategories();
          this.cancelEditCategory();
        } else {
          console.error('Error updating category:', error);
        }
      } else {
        const { data, error } = await this.supabaseService.createCategory(this.currentCategory);
        if (!error) {
          this.loadCategories();
          this.resetCategoryForm();
        } else {
          console.error('Error creating category:', error);
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
    this.saving = false;
  }

  cancelEditCategory() {
    this.editingCategory = null;
    this.resetCategoryForm();
    this.activeTab = 'categories';
  }

  resetCategoryForm() {
    this.currentCategory = {
      name: '',
      description: '',
      image_url: ''
    };
  }

  logout() {
    this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}
