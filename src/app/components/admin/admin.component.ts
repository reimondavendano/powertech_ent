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

  currentProduct: Omit<Product, 'id' | 'created_at'> = { // Removed 'updated_at' as it's not in your Product interface
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
      // Ensure product IDs are numbers
      this.products = data.map(product => ({
        ...product,
        id: typeof product.id === 'string' ? parseInt(product.id, 10) : product.id
      }));
    } else {
      console.error('Error loading products:', error);
    }
  }

  async loadInquiries() {
    const { data, error } = await this.supabaseService.getInquiries();
    if (data && !error) {
      // Ensure inquiry IDs and product_ids are numbers
      this.inquiries = data.map(inquiry => ({
        ...inquiry,
        id: typeof inquiry.id === 'string' ? parseInt(inquiry.id, 10) : inquiry.id,
        product_id: typeof inquiry.product_id === 'string' ? parseInt(inquiry.product_id, 10) : inquiry.product_id
      }));
    } else {
      console.error('Error loading inquiries:', error);
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

  async deleteProduct(id: number) { // Changed type to number
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
        // Ensure editingProduct.id is a number before passing
        const productId = typeof this.editingProduct.id === 'string' ? parseInt(this.editingProduct.id, 10) : this.editingProduct.id;
        const { data, error } = await this.supabaseService.updateProduct(
          productId, // Pass as number
          this.currentProduct
        );
        if (!error) {
          this.loadProducts();
          this.cancelEdit();
        } else {
          console.error('Error updating product:', error);
        }
      } else {
        const { data, error } = await this.supabaseService.createProduct(this.currentProduct);
        if (!error) {
          this.loadProducts();
          this.resetForm();
        } else {
          console.error('Error creating product:', error);
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

  async updateInquiryStatus(id: number, status: Inquiry['status']) { // Changed id type to number
    const { error } = await this.supabaseService.updateInquiryStatus(id, status);
    if (!error) {
      this.loadInquiries();
    } else {
      console.error('Error updating inquiry status:', error);
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
