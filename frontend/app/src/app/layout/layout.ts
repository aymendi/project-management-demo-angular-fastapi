import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ThemeService } from '../shared/theme.service';
import { AuthTokenService } from '../auth-token.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  private tokenService = inject(AuthTokenService);
  private themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  menuItems = [
    { label: 'Products', icon: 'inventory_2', route: '/products' },
    {
      label: 'Theme',
      icon: 'brightness_6',
      action: () => this.themeService.toggleTheme()
    },
    {
      label: 'Language',
      icon: 'language',
      action: () => this.toggleLanguage()
    },
  ];

  constructor() {
    // load saved language on startup (default en)
    const saved = localStorage.getItem('lang') || 'en';
    this.translate.setDefaultLang('en');
    this.translate.use(saved);
  }

  toggleLanguage() {
    const current = this.translate.currentLang || localStorage.getItem('lang') || 'en';
    const next = current === 'en' ? 'fr' : 'en';
    this.translate.use(next);
    localStorage.setItem('lang', next);
  }

  getThemeIcon() {
    return this.themeService.currentTheme() ? 'light_mode' : 'dark_mode';
  }

  logout() {
    this.tokenService.removeToken?.();
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
