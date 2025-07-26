import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService, Product, Inquiry } from '../../services/supabase.service';
import { HeaderComponent } from "../header/header.component";
import emailjs from '@emailjs/browser'; // Import EmailJS

@Component({
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './inquiry.component.html', // Point to external HTML file
  styleUrls: ['./inquiry.component.css'] // Point to external CSS file
})
export class InquiryComponent implements OnInit {
  selectedProduct: Product | null = null;
  inquiry: Omit<Inquiry, 'id' | 'created_at'> = {
    name: '',
    email: '',
    phone: '',
    product_id: '', // Ensure this is initialized as an empty string
    message: '',
    status: 'pending'
  };

  submitting = false;
  showSuccessMessage = false;
  errorMessage = '';

  // IMPORTANT: Replace with your actual EmailJS IDs
  private emailJsPublicKey: string = 'XYDu8yJR6s_1X8-fU'; // e.g., 'YOUR_PUBLIC_KEY'
  private emailJsServiceId: string = 'service_c7d452f'; // e.g., 'service_xxxxxx'
  private emailJsTemplateId: string = 'template_67ciqiv'; // e.g., 'template_xxxxxx'

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Initialize EmailJS
    emailjs.init(this.emailJsPublicKey);

    // Check if there's a product ID in the query params
    this.route.queryParams.subscribe(params => {
      if (params['product']) {
        this.loadSelectedProduct(params['product']);
        this.inquiry.product_id = params['product']; // This line is correct
      }
      if (params['name']) {
        // Pre-fill message with product name
        this.inquiry.message = `I am interested in ${decodeURIComponent(params['name'])}. Please provide more information about pricing and availability.`;
      }
    });
  }

  async loadSelectedProduct(productId: string) {
    const { data, error } = await this.supabaseService.getProduct(productId);
    if (data && !error) {
      this.selectedProduct = data;
    } else {
      console.error('Error loading product:', error);
      this.selectedProduct = null; // Ensure selectedProduct is null if not found
    }
  }

  async submitInquiry() {
    this.submitting = true;
    this.errorMessage = '';
    this.showSuccessMessage = false;

    try {
      // 1. Submit inquiry to Supabase (existing logic)
      const { data, error: supabaseError } = await this.supabaseService.createInquiry(this.inquiry);

      if (supabaseError) {
        this.errorMessage = 'Failed to save inquiry to database. Please try again.';
        console.error('Error creating inquiry in Supabase:', supabaseError);
        this.submitting = false;
        return; // Stop if Supabase submission fails
      }

      // 2. Send email using EmailJS
      const templateParams = {
        from_name: this.inquiry.name,
        from_email: this.inquiry.email,
        from_phone: this.inquiry.phone || 'N/A', // Provide a fallback if phone is optional
        message: this.inquiry.message,
        product_name: this.selectedProduct ? this.selectedProduct.name : 'General Inquiry'
      };

      await emailjs.send(this.emailJsServiceId, this.emailJsTemplateId, templateParams);

      // If both Supabase and EmailJS succeed
      this.showSuccessMessage = true;
      this.resetForm();
      // Hide success message after 5 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);

    } catch (emailJsError: any) {
      // Handle EmailJS specific errors
      this.errorMessage = 'Inquiry saved to database, but failed to send email notification. Please check EmailJS setup.';
      console.error('Error sending email with EmailJS:', emailJsError);
    } finally {
      this.submitting = false;
    }
  }

  resetForm() {
    this.inquiry = {
      name: '',
      email: '',
      phone: '',
      product_id: this.selectedProduct ? this.selectedProduct.id : '',
      message: this.selectedProduct ? `I am interested in ${this.selectedProduct.name}. Please provide more information about pricing and availability.` : '',
      status: 'pending'
    };
  }
}
