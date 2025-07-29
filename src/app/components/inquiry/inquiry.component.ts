import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService, Product } from '../../services/supabase.service';
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

  chatMessages: { text: string, sender: 'user' | 'bot' }[] = [];
  currentMessage: string = '';
  isBotTyping: boolean = false;
  showFacebookContact: boolean = false;
  facebookPageUrl: string = 'https://www.facebook.com/powertech.ent.2016'; // REMINDER: Update this with your actual Facebook page URL

  // You can update this prompt to guide the chatbot's behavior (for a real AI integration)
  // For this simulated version, it's just a placeholder.
  botPrompt: string = `You are a helpful assistant for PowerTech. Answer questions about products, availability, and general inquiries. If you cannot answer based on available information, suggest contacting via Facebook. Be concise.`;

  constructor(
    private supabaseService: SupabaseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
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
      }, 500); // Small delay to simulate bot 'appearing'
    });
  }

  async loadSelectedProduct(productId: number) {
    const { data, error } = await this.supabaseService.getProduct(productId);
    if (data && !error) {
      this.selectedProduct = data;
      // You can add a specific bot message related to the selected product here
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
    this.showFacebookContact = false; // Hide Facebook link until needed again

    // Simulate chatbot thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));

    let botResponse = '';
    const lowerUserMsg = userMsg.toLowerCase();

    // --- Enhanced Chatbot Logic ---

    // Fetch all products to search through
    const allProducts = (await this.supabaseService.getProducts()).data || [];

    // Attempt to find a specific product by name or significant keywords from its name/description
    let matchedProduct: Product | undefined;
    for (const product of allProducts) {
      const productNameLower = product.name.toLowerCase();
      const productDescriptionLower = product.description ? product.description.toLowerCase() : '';

      // Check for full product name match or significant keywords from the name
      const nameKeywords = productNameLower.split(' ').filter(word => word.length > 2); // Split and filter short words
      if (lowerUserMsg.includes(productNameLower) || nameKeywords.some(keyword => lowerUserMsg.includes(keyword))) {
        matchedProduct = product;
        break; // Found a strong product match, prioritize this
      }

      // Check for keywords in the description if no name match yet
      if (!matchedProduct && productDescriptionLower && productDescriptionLower.split(' ').some(keyword => lowerUserMsg.includes(keyword) && keyword.length > 2)) {
        matchedProduct = product;
        // Do not break here, continue to see if a more direct name match exists
      }
    }

    // If a specific product was matched or pre-selected
    const productToDiscuss = matchedProduct || this.selectedProduct;

    if (productToDiscuss) {
      if (lowerUserMsg.includes('how much') || lowerUserMsg.includes('price')) {
        botResponse = `The price for the ${productToDiscuss.name} is ₱${productToDiscuss.price?.toFixed(2)}.`;
      } else if (lowerUserMsg.includes('stock') || lowerUserMsg.includes('availability') || lowerUserMsg.includes('do you have') || lowerUserMsg.includes('is there')) {
        const stockStatus = productToDiscuss.stock > 0 ? `Yes, we currently have ${productToDiscuss.stock} units of ${productToDiscuss.name} in stock.` : `Unfortunately, the ${productToDiscuss.name} is currently out of stock.`;
        botResponse = `${stockStatus} We'd be happy to assist you further with this product!`;
      } else if (lowerUserMsg.includes('description') || lowerUserMsg.includes('details') || lowerUserMsg.includes('what is')) {
        botResponse = `The ${productToDiscuss.name} is a ${productToDiscuss.category}. Here are some details: ${productToDiscuss.description}`;
      } else if (lowerUserMsg.includes('warranty')) {
        botResponse = 'For warranty information regarding the ' + productToDiscuss.name + ', please refer to its product page or contact us via Facebook.';
      }
    }

    // If no specific product response, check for category inquiries
    if (!botResponse) {
      let matchedCategory: string | undefined;
      for (const product of allProducts) {
        if (lowerUserMsg.includes(product.category.toLowerCase())) {
          matchedCategory = product.category;
          break;
        }
      }

      if (matchedCategory) {
        const productsInCategory = allProducts.filter(p => p.category.toLowerCase() === matchedCategory?.toLowerCase());
        if (lowerUserMsg.includes('how much') || lowerUserMsg.includes('price')) {
          if (productsInCategory.length > 0) {
            const prices = productsInCategory.map(p => p.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            botResponse = `Our ${matchedCategory} products typically range from ₱${minPrice.toFixed(2)} to ₱${maxPrice.toFixed(2)}. Do you have a specific model in mind?`;
          } else {
            botResponse = `We don't seem to have any products listed under ${matchedCategory} at the moment.`;
          }
        } else if (lowerUserMsg.includes('do you have') || lowerUserMsg.includes('is there')) {
          if (productsInCategory.length > 0) {
            const productNames = productsInCategory.map(p => p.name).join(', ');
            botResponse = `Yes, we have several ${matchedCategory} products, including: ${productNames}. Are you looking for a specific model?`;
          } else {
            botResponse = `We don't seem to have any products listed under ${matchedCategory} at the moment.`;
          }
        }
      }
    }

    // Fallback if no specific answer is found or if user asks to contact
    if (!botResponse || lowerUserMsg.includes('contact') || lowerUserMsg.includes('help') || lowerUserMsg.includes('admin') || lowerUserMsg.includes('facebook')) {
      botResponse = botResponse + (botResponse ? ' Also, ' : '') + 'For direct assistance or if I couldn\'t fully answer your question, please contact us via our Facebook page.';
      this.showFacebookContact = true;
    }


    // --- End Enhanced Chatbot Logic ---

    this.addBotMessage(botResponse);
    this.isBotTyping = false;
  }

  addMessage(text: string, sender: 'user' | 'bot') {
    this.chatMessages.push({ text, sender });
    // Scroll to the bottom of the chat
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
