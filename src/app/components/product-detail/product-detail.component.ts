// src/app/components/product-detail/product-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService, Product, Category } from '../../services/supabase.service';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser'; // Import Meta and Title services

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  isLoading: boolean = true;
  errorMessage: string = '';
  quantity: number = 1;
  selectedThumbnail: string | null = null;
  productImages: string[] = [];
  categoryName: string = 'Unknown Category';

  productSpecs: { [key: string]: any; } = {};

  selectedTab: 'overview' | 'specifications' | 'reviews' = 'overview';

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private meta: Meta, // Inject Meta service
    private titleService: Title // Inject Title service
  ) {}

  ngOnInit(): void {
    this.loadProductDetails();
  }

  async loadProductDetails(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      const { data, error } = await this.supabaseService.getProductById(parseInt(productId, 10));
      if (data) {
        this.product = data;

        this.productImages = [this.product.image_url || 'https://placehold.co/600x600?text=No+Image'];
        // For testing multiple thumbnails, you can uncomment these placeholders:
        // this.productImages.push('https://placehold.co/600x600?text=Placeholder+2');
        // this.productImages.push('https://placehold.co/600x600?text=Placeholder+3');


        if (this.productImages.length > 0) {
          this.selectedThumbnail = this.productImages[0];
        } else {
          this.selectedThumbnail = 'https://placehold.co/600x600?text=No+Image';
        }

        if ((data as any).specs) {
          try {
            this.productSpecs = typeof (data as any).specs === 'string'
                                ? JSON.parse((data as any).specs)
                                : (data as any).specs;
          } catch (e) {
            console.error('Error parsing product specs JSON:', e);
            this.productSpecs = {};
          }
        } else {
          this.productSpecs = {};
        }

        // Fetch category name
        if (this.product.category_id) {
          const { data: categoryData, error: categoryError } = await this.supabaseService.getCategoryById(this.product.category_id);
          if (categoryData && !categoryError) {
            this.categoryName = categoryData.name;
          } else {
            console.error('Error fetching category:', categoryError);
            this.categoryName = 'Unknown Category';
          }
        }

        // --- IMPORTANT: Set Open Graph Meta Tags for Facebook Sharing ---
        const pageTitle = `${this.product.name} - PowerTech`;
        const pageDescription = this.product.description || 'Check out this amazing product from PowerTech!';
        const imageUrl = this.product.image_url || 'https://placehold.co/1200x630?text=PowerTech+Product'; // Use a default image if product has none
        const productUrl = window.location.href; // Get the current page URL

        this.titleService.setTitle(pageTitle); // Set the browser tab title

        this.meta.updateTag({ property: 'og:title', content: pageTitle });
        this.meta.updateTag({ property: 'og:description', content: pageDescription });
        this.meta.updateTag({ property: 'og:image', content: imageUrl });
        this.meta.updateTag({ property: 'og:url', content: productUrl });
        this.meta.updateTag({ property: 'og:type', content: 'product' }); // Or 'website' if more general
        this.meta.updateTag({ property: 'og:image:width', content: '1200' }); // Recommended dimensions
        this.meta.updateTag({ property: 'og:image:height', content: '630' }); // Recommended dimensions
        // --- End Open Graph Meta Tags ---

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

  selectThumbnail(imageUrl: string) {
    this.selectedThumbnail = imageUrl;
  }

  changeQuantity(delta: number) {
    this.quantity = Math.max(1, this.quantity + delta);
    if (this.product?.stock !== undefined) {
      this.quantity = Math.min(this.quantity, this.product.stock);
    }
  }

  onQuantityInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = Number(inputElement.value);

    if (isNaN(inputValue) || inputValue < 1) {
      this.quantity = 1;
    } else {
      const maxStock = this.product?.stock !== undefined ? this.product.stock : Infinity;
      this.quantity = Math.min(inputValue, maxStock);
    }
    inputElement.value = this.quantity.toString();
  }

  selectTab(tab: 'overview' | 'specifications' | 'reviews') {
    this.selectedTab = tab;
  }

  openInquiry() {
    if (this.product) {
      console.log(`Navigating to inquiry for: ${this.product.name}`);
      window.location.href = `/inquiry?product=${this.product.id}`;
    }
  }

  addToCart() {
    if (this.product) {
      console.log(`Added ${this.quantity} of ${this.product.name} to cart!`);
    }
  }

  addToWishlist() {
    if (this.product) {
      console.log(`Added ${this.product.name} to wishlist!`);
    }
  }

  compareProduct() {
    if (this.product) {
      console.log(`Comparing ${this.product.name}!`);
    }
  }

  shareOnFacebook() {
    if (this.product) {
      const productUrl = window.location.href; // Current product page URL
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
      window.open(facebookShareUrl, '_blank', 'width=600,height=400');
    }
  }

  getProductSpecsKeys(): string[] {
    return Object.keys(this.productSpecs).filter(key => key !== 'rating');
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
