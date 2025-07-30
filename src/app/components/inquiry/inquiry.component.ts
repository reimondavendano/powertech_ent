import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService, Product, Category } from '../../services/supabase.service'; // Import Category
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.css']
})
export class InquiryComponent implements OnInit {
  selectedProduct: Product | null = null;
  categories: Category[] = []; // To store all categories
  categoryMap: Map<number, string> = new Map(); // To easily get category name by ID

  chatMessages: { text: string, sender: 'user' | 'bot' }[] = [];
  currentMessage: string = '';
  isBotTyping: boolean = false;
  showFacebookContact: boolean = false;
  facebookPageUrl: string = 'https://www.facebook.com/powertech.ent.2016';

  botPrompt: string = `You are a helpful assistant for PowerTech. Answer questions about products, availability, and general inquiries. If you cannot answer based on available information, suggest contacting via Facebook. Be concise.`;

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Load categories first, as products depend on them for display
    await this.loadCategories();

    this.route.queryParams.subscribe(params => {
      if (params['product']) {
        const productIdAsNumber = parseInt(params['product'], 10);
        if (!isNaN(productIdAsNumber)) {
          this.loadSelectedProduct(productIdAsNumber);
        } else {
          console.error('Invalid product ID received from query params:', params['product']);
        }
      }

      // Initial bot message welcoming the user
      setTimeout(() => {
        this.addBotMessage('Hello! How can I assist you with PowerTech products today?');
      }, 500);
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

  async loadSelectedProduct(productId: number) {
    const { data, error } = await this.supabaseService.getProduct(productId);
    if (data && !error) {
      this.selectedProduct = data;
      this.addBotMessage(`You're inquiring about the ${this.selectedProduct.name}. How can I help with this product?`);
    } else {
      console.error('Error loading product:', error);
      this.selectedProduct = null;
    }
  }

  async sendMessage() {
    const userMsg = this.currentMessage.trim();
    if (!userMsg) return;

    this.addMessage(userMsg, 'user');
    this.currentMessage = '';
    this.isBotTyping = true;
    this.showFacebookContact = false;

    await new Promise(resolve => setTimeout(resolve, 1500));

    let botResponse = '';
    const lowerUserMsg = userMsg.toLowerCase();

    const allProducts = (await this.supabaseService.getProducts()).data || [];

    let matchedProduct: Product | undefined;
    for (const product of allProducts) {
      const productNameLower = product.name.toLowerCase();
      const productDescriptionLower = product.description ? product.description.toLowerCase() : '';

      const nameKeywords = productNameLower.split(' ').filter(word => word.length > 2);
      if (lowerUserMsg.includes(productNameLower) || nameKeywords.some(keyword => lowerUserMsg.includes(keyword))) {
        matchedProduct = product;
        break;
      }

      if (!matchedProduct && productDescriptionLower && productDescriptionLower.split(' ').some(keyword => lowerUserMsg.includes(keyword) && keyword.length > 2)) {
        matchedProduct = product;
      }
    }

    const productToDiscuss = matchedProduct || this.selectedProduct;

    if (productToDiscuss) {
      if (lowerUserMsg.includes('how much') || lowerUserMsg.includes('price')) {
        botResponse = `The price for the ${productToDiscuss.name} is ₱${productToDiscuss.price?.toFixed(2)}.`;
      } else if (lowerUserMsg.includes('stock') || lowerUserMsg.includes('availability') || lowerUserMsg.includes('do you have') || lowerUserMsg.includes('is there')) {
        const stockStatus = productToDiscuss.stock > 0 ? `Yes, we currently have ${productToDiscuss.stock} units of ${productToDiscuss.name} in stock.` : `Unfortunately, the ${productToDiscuss.name} is currently out of stock.`;
        botResponse = `${stockStatus} We'd be happy to assist you further with this product!`;
      } else if (lowerUserMsg.includes('description') || lowerUserMsg.includes('details') || lowerUserMsg.includes('what is')) {
        const categoryName = this.getCategoryName(productToDiscuss.category_id);
        botResponse = `The ${productToDiscuss.name} is a ${categoryName}. Here are some details: ${productToDiscuss.description}`;
      } else if (lowerUserMsg.includes('warranty')) {
        botResponse = 'For warranty information regarding the ' + productToDiscuss.name + ', please refer to its product page or contact us via Facebook.';
      }
    }

    if (!botResponse) {
      let matchedCategoryName: string | undefined;
      for (const category of this.categories) {
        if (lowerUserMsg.includes(category.name.toLowerCase())) {
          matchedCategoryName = category.name;
          break;
        }
      }

      if (matchedCategoryName) {
        const matchedCategoryId = Array.from(this.categoryMap.entries()).find(([, name]) => name.toLowerCase() === matchedCategoryName?.toLowerCase())?.[0];

        if (matchedCategoryId !== undefined) {
          const productsInCategory = allProducts.filter(p => p.category_id === matchedCategoryId);
          if (lowerUserMsg.includes('how much') || lowerUserMsg.includes('price')) {
            if (productsInCategory.length > 0) {
              const prices = productsInCategory.map(p => p.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              botResponse = `Our ${matchedCategoryName} products typically range from ₱${minPrice.toFixed(2)} to ₱${maxPrice.toFixed(2)}. Do you have a specific model in mind?`;
            } else {
              botResponse = `We don't seem to have any products listed under ${matchedCategoryName} at the moment.`;
            }
          } else if (lowerUserMsg.includes('do you have') || lowerUserMsg.includes('is there')) {
            if (productsInCategory.length > 0) {
              const productNames = productsInCategory.map(p => p.name).join(', ');
              botResponse = `Yes, we have several ${matchedCategoryName} products, including: ${productNames}. Are you looking for a specific model?`;
            } else {
              botResponse = `We don't seem to have any products listed under ${matchedCategoryName} at the moment.`;
            }
          }
        }
      }
    }

    if (!botResponse || lowerUserMsg.includes('contact') || lowerUserMsg.includes('help') || lowerUserMsg.includes('admin') || lowerUserMsg.includes('facebook')) {
      botResponse = botResponse + (botResponse ? ' Also, ' : '') + 'For direct assistance or if I couldn\'t fully answer your question, please contact us via our Facebook page.';
      this.showFacebookContact = true;
    }

    this.addBotMessage(botResponse);
    this.isBotTyping = false;
  }

  addMessage(text: string, sender: 'user' | 'bot') {
    this.chatMessages.push({ text, sender });
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }

  addBotMessage(text: string) {
    this.addMessage(text, 'bot');
  }
}
