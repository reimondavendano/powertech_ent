// src/main.ts
import { Component, InjectionToken, ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Import your routes
import { routes } from './app/app.routes.js'; // Keep .js here if app.routes.ts is also compiled as ESM

// FIX: Remove the .js extension from environment import
import { environment } from './environments/environment.development'; // <--- CHANGE THIS LINE

// Import your Supabase service
import { SupabaseService } from './app/services/supabase.service.js'; // Keep .js here if compiled as ESM

// Define an injection token for your environment configuration
export const APP_ENVIRONMENT = new InjectionToken<typeof environment>('app.environment');


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <main>
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-black text-white py-12">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-red-600 to-black rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-lg">PT</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold">POWERTECH</h3>
                  <p class="text-sm text-gray-400">YOUR I.T. SOLUTION PARTNER</p>
                </div>
              </div>
              <p class="text-gray-400 text-sm">
                Specializing in computer parts, accessories, brand new laptops, and printers.
                We offer both wholesale and retail services.
              </p>
            </div>

            <div>
              <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
              <ul class="space-y-2 text-gray-400">
                <li><a href="/" class="hover:text-red-500 transition-colors">Home</a></li>
                <li><a href="/products" class="hover:text-red-500 transition-colors">Products</a></li>
                <li><a href="/inquiry" class="hover:text-red-500 transition-colors">Make Inquiry</a></li>
              </ul>
            </div>

            <div>
              <h4 class="text-lg font-semibold mb-4">Contact Info</h4>
              <ul class="space-y-2 text-gray-400 text-sm">
                <li>📧 info&#64;powertech.com</li>
                <li>📱 +63 XXX XXX XXXX</li>
                <li>📍 Philippines</li>
              </ul>
            </div>
          </div>

          <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 PowerTech Enterprises. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    { provide: APP_ENVIRONMENT, useValue: environment },
    SupabaseService,
    
  ]
});