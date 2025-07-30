// src/app/home/home.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService, Product, Category } from '../../services/supabase.service';
import { HeaderComponent } from "../header/header.component";
import { Subscription, interval } from 'rxjs'; // Import Subscription and interval

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  topSellers: Product[] = [];
  categories: Category[] = [];
  categoryMap: Map<number, string> = new Map();

  // Product slider properties
  currentSlideIndex: number = 0;
  itemsPerSlide: number = 4; // Number of products per slide
  

  // Category slider properties
  highlightedCategories: Category[] = [];
  currentCategorySlideIndex: number = 0;
  categoryItemsPerSlide: number = 6; // Number of categories per slide
  private categoryAutoSlideSubscription: Subscription | undefined; // For auto-sliding categories

  // Hero Carousel properties
  heroBanners = [
    {
      title: 'COMPUTER PARTS AND ACCESSORIES',
      subtitle: 'BRANDNEW LAPTOP & PRINTERS',
      description: 'WHOLESALE AND RETAIL',
      viewProductsLink: '/products',
      makeInquiryLink: '/inquiry',
      image_url: '../../../assets/images/2.png' // <-- Update this path to your actual image
    },
    {
      title: 'BUILD YOUR DREAM PC',
      subtitle: 'CUSTOM BUILDS FOR EVERY NEED',
      description: 'EXPERIENCE UNMATCHED PERFORMANCE',
      viewProductsLink: '/products',
      makeInquiryLink: '/inquiry',
      image_url: '../../../assets/images/powertechbanner.jpg' // <-- Update this path to your actual image
    },
    {
      title: 'LATEST GRAPHIC CARDS',
      subtitle: 'POWER YOUR GAMING EXPERIENCE',
      description: 'UNLEASH REALISTIC VISUALS',
      viewProductsLink: '/products',
      makeInquiryLink: '/inquiry',
      image_url: 'https://placehold.co/1920x600/666666/FFFFFF/png?text=Graphics+Card' // Placeholder image 3
    }
  ];
  currentHeroSlideIndex: number = 0;
  private heroAutoSlideSubscription: Subscription | undefined;


  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadCategories();
    this.loadAllProducts();
    this.startCategoryAutoSlide(); // Start auto-sliding for categories
    this.startHeroAutoSlide(); // Start auto-sliding for hero carousel
  }

  ngOnDestroy() {
    if (this.categoryAutoSlideSubscription) {
      this.categoryAutoSlideSubscription.unsubscribe();
    }
    if (this.heroAutoSlideSubscription) {
      this.heroAutoSlideSubscription.unsubscribe();
    }
  }

  async loadCategories() {
    const { data, error } = await this.supabaseService.getCategories();
    if (data && !error) {
      this.categories = data;
      this.categories.forEach(category => {
        this.categoryMap.set(category.id, category.name);
      });
      this.highlightedCategories = this.categories.slice(0, 12);
    } else {
      console.error('Error loading categories:', error);
    }
  }

  getCategoryName(categoryId: number): string {
    return this.categoryMap.get(categoryId) || 'Unknown Category';
  }

  async loadAllProducts() {
    const { data, error } = await this.supabaseService.getProducts();
    if (data && !error) {
      this.featuredProducts = data;

      this.newArrivals = [...data]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6);

      this.topSellers = [...data]
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 6);

    } else if (error) {
      console.error('Error loading products:', error);
    }
  }

  // Product Slider Logic
  get totalProductSlides(): number {
    return this.itemsPerSlide > 0 ? Math.ceil(this.featuredProducts.length / this.itemsPerSlide) : 0;
  }

  nextProductSlide() {
    if (this.currentSlideIndex < this.totalProductSlides - 1) {
      this.currentSlideIndex++;
    } else {
      this.currentSlideIndex = 0;
    }
  }

  prevProductSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else {
      this.currentSlideIndex = this.totalProductSlides - 1;
    }
  }

  // Category Slider Logic
  get totalCategorySlides(): number {
    return this.categoryItemsPerSlide > 0 ? Math.ceil(this.highlightedCategories.length / this.categoryItemsPerSlide) : 0;
  }

  nextCategorySlide() {
    if (this.currentCategorySlideIndex < this.totalCategorySlides - 1) {
      this.currentCategorySlideIndex++;
    } else {
      this.currentCategorySlideIndex = 0;
    }
  }

  prevCategorySlide() {
    if (this.currentCategorySlideIndex > 0) {
      this.currentCategorySlideIndex--;
    } else {
      this.currentCategorySlideIndex = this.totalCategorySlides - 1;
    }
  }

  goToCategorySlide(index: number) {
    this.currentCategorySlideIndex = index;
  }

  startCategoryAutoSlide() {
    if (this.categoryAutoSlideSubscription) {
      this.categoryAutoSlideSubscription.unsubscribe();
    }
    this.categoryAutoSlideSubscription = interval(5000).subscribe(() => {
      this.nextCategorySlide();
    });
  }

  stopCategoryAutoSlide() {
    if (this.categoryAutoSlideSubscription) {
      this.categoryAutoSlideSubscription.unsubscribe();
    }
  }

  // Hero Carousel Logic
  get totalHeroSlides(): number {
    return this.heroBanners.length;
  }

  nextHeroSlide() {
    if (this.currentHeroSlideIndex < this.totalHeroSlides - 1) {
      this.currentHeroSlideIndex++;
    } else {
      this.currentHeroSlideIndex = 0; // Loop back
    }
  }

  prevHeroSlide() {
    if (this.currentHeroSlideIndex > 0) {
      this.currentHeroSlideIndex--;
    } else {
      this.currentHeroSlideIndex = this.totalHeroSlides - 1; // Loop to last
    }
  }

  goToHeroSlide(index: number) {
    this.currentHeroSlideIndex = index;
  }

  startHeroAutoSlide() {
    if (this.heroAutoSlideSubscription) {
      this.heroAutoSlideSubscription.unsubscribe();
    }
    this.heroAutoSlideSubscription = interval(7000).subscribe(() => { // Auto-slide every 7 seconds
      this.nextHeroSlide();
    });
  }

  stopHeroAutoSlide() {
    if (this.heroAutoSlideSubscription) {
      this.heroAutoSlideSubscription.unsubscribe();
    }
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }

  openInquiry(product: Product) {
    console.log(`Inquiring about: ${product.name} (ID: ${product.id})`);
    window.location.href = `/inquiry?product=${product.id}`;
  }
}
