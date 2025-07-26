import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; // Import BehaviorSubject
import { User } from '@supabase/supabase-js'; // Import User if not already there

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  product_id: string; // Changed from product_name to product_id
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Add currentUser$ BehaviorSubject
  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();

  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'Gaming Laptop RTX 4060',
      category: 'Laptops',
      price: 75000,
      stock: 15,
      description: 'High-performance gaming laptop with RTX 4060 graphics card, perfect for gaming and professional work.',
      image_url: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Mechanical Gaming Keyboard',
      category: 'Accessories',
      price: 3500,
      stock: 25,
      description: 'RGB mechanical keyboard with blue switches, perfect for gaming and typing.',
      image_url: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800',
      created_at: '2024-01-14T09:30:00Z'
    },
    {
      id: '3',
      name: 'Wireless Gaming Mouse',
      category: 'Accessories',
      price: 2800,
      stock: 30,
      description: 'High-precision wireless gaming mouse with customizable RGB lighting.',
      image_url: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800',
      created_at: '2024-01-13T14:20:00Z'
    },
    {
      id: '4',
      name: 'All-in-One Printer',
      category: 'Printers',
      price: 8500,
      stock: 12,
      description: 'Multifunction printer with scanning, copying, and wireless printing capabilities.',
      image_url: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800',
      created_at: '2024-01-12T11:45:00Z'
    },
    {
      id: '5',
      name: 'Business Laptop',
      category: 'Laptops',
      price: 45000,
      stock: 20,
      description: 'Professional laptop ideal for business use with long battery life and lightweight design.',
      image_url: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
      created_at: '2024-01-11T16:15:00Z'
    },
    {
      id: '6',
      name: 'External Hard Drive 2TB',
      category: 'Storage',
      price: 4200,
      stock: 40,
      description: 'Portable 2TB external hard drive with USB 3.0 for fast data transfer.',
      image_url: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800',
      created_at: '2024-01-10T13:30:00Z'
    }
  ];

  private mockInquiries: Inquiry[] = [
    {
      id: '1',
      name: 'Juan Dela Cruz',
      email: 'juan@email.com',
      phone: '+63 912 345 6789',
      product_id: '1', // Ensure this uses product_id
      message: 'Hi, I\'m interested in this gaming laptop. Can you provide more details about the warranty and payment options?',
      status: 'pending',
      created_at: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '+63 917 654 3210',
      product_id: '4', // Ensure this uses product_id
      message: 'Do you have this printer available for pickup? I need it for my home office.',
      status: 'responded',
      created_at: '2024-01-14T10:15:00Z'
    }
  ];

  constructor() {}

  // Mock authentication
  async signIn(email: string, password: string) {
    return new Promise(async (resolve) => { // Made async to allow await on mock calls
      setTimeout(() => {
        if (email === 'admin@powertech.com' && password === 'admin123') {
          const user: User = { id: '1', email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
          this._currentUser.next(user); // Emit the user upon successful login
          resolve({ data: { user }, error: null });
        } else {
          this._currentUser.next(null); // Emit null on failed login
          resolve({ data: null, error: { message: 'Invalid credentials' } });
        }
      }, 1000);
    });
  }

  async signOut() {
    this._currentUser.next(null); // Emit null when signing out
    return { error: null };
  }

  // Product methods
  async getProducts(): Promise<{ data: Product[] | null, error: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hasError = Math.random() < 0.1;
        if (hasError) {
          resolve({ data: null, error: { message: 'Failed to fetch products (simulated error)' } });
        } else {
          resolve({ data: [...this.mockProducts], error: null });
        }
      }, 500);
    });
  }

  async getProduct(id: string): Promise<{ data: Product | null, error: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = this.mockProducts.find(p => p.id === id);
        if (product) {
          resolve({ data: product, error: null });
        } else {
          resolve({ data: null, error: { message: 'Product not found' } });
        }
      }, 500);
    });
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<{ data: Product | null, error: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct: Product = {
          ...product,
          id: (this.mockProducts.length + 1).toString(),
          created_at: new Date().toISOString()
        };
        this.mockProducts.push(newProduct);
        resolve({ data: newProduct, error: null });
      }, 500);
    });
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ data: Product | null, error: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          this.mockProducts[index] = { ...this.mockProducts[index], ...updates };
          resolve({ data: this.mockProducts[index], error: null });
        } else {
          resolve({ data: null, error: { message: 'Product not found' } });
        }
      }, 500);
    });
  }

  async deleteProduct(id: string): Promise<{ error: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          this.mockProducts.splice(index, 1);
          resolve({ error: null });
        } else {
          resolve({ error: { message: 'Product not found' } });
        }
      }, 500);
    });
  }

  // Inquiry methods
  async getInquiries(): Promise<{ data: Inquiry[] | null, error: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hasError = Math.random() < 0.1;
        if (hasError) {
          resolve({ data: null, error: { message: 'Failed to fetch inquiries (simulated error)' } });
        } else {
          resolve({ data: [...this.mockInquiries], error: null });
        }
      }, 500);
    });
  }

  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at' | 'status'>): Promise<{ data: Inquiry | null, error: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInquiry: Inquiry = {
          ...inquiry,
          id: (this.mockInquiries.length + 1).toString(),
          status: 'pending',
          created_at: new Date().toISOString()
        };
        this.mockInquiries.push(newInquiry);
        resolve({ data: newInquiry, error: null });
      }, 500);
    });
  }

  async updateInquiryStatus(id: string, status: Inquiry['status']): Promise<{ data: Inquiry | null, error: any }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.mockInquiries.findIndex(i => i.id === id);
        if (index !== -1) {
          this.mockInquiries[index].status = status;
          resolve({ data: this.mockInquiries[index], error: null });
        } else {
          resolve({ data: null, error: { message: 'Inquiry not found' } });
        }
      }, 500);
    });
  }
}