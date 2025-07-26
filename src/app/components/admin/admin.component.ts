import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService, Product, Inquiry } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true, // Keep this as standalone
  imports: [CommonModule, FormsModule], // Import CommonModule and FormsModule here
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: 'products' | 'inquiries' | 'add-product' = 'products';
  products: Product[] = [];
  inquiries: Inquiry[] = [];
  editingProduct: Product | null = null;
  saving = false;
  
  currentProduct: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    image_url: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadInquiries();
  }

  async loadProducts() {
    const { data, error } = await this.supabaseService.getProducts();
    if (data && !error) {
      this.products = data;
    }
  }

  async loadInquiries() {
    const { data, error } = await this.supabaseService.getInquiries();
    if (data && !error) {
      this.inquiries = data;
    }
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.currentProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image_url: product.image_url || ''
    };
    this.activeTab = 'add-product';
  }

  async deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await this.supabaseService.deleteProduct(id);
      if (!error) {
        this.loadProducts();
      }
    }
  }

  async saveProduct() {
    this.saving = true;
    
    try {
      if (this.editingProduct) {
        const { data, error } = await this.supabaseService.updateProduct(
          this.editingProduct.id!,
          this.currentProduct
        );
        if (!error) {
          this.loadProducts();
          this.cancelEdit();
        }
      } else {
        const { data, error } = await this.supabaseService.createProduct(this.currentProduct);
        if (!error) {
          this.loadProducts();
          this.resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
    
    this.saving = false;
  }

  cancelEdit() {
    this.editingProduct = null;
    this.resetForm();
    this.activeTab = 'products';
  }

  resetForm() {
    this.currentProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      image_url: ''
    };
  }

  async updateInquiryStatus(id: string, status: Inquiry['status']) {
    const { error } = await this.supabaseService.updateInquiryStatus(id, status);
    if (!error) {
      this.loadInquiries();
    }
  }

  getStatusClass(status: Inquiry['status']): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  logout() {
    this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}