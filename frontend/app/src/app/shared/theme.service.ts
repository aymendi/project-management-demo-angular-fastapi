import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private isDark = signal<boolean>(this.getSavedTheme() === 'dark');

  currentTheme = this.isDark.asReadonly();

  constructor() {
    // Apply initial theme
    this.applyTheme();

    // Sync changes to DOM + localStorage
    effect(() => {
      this.applyTheme();
      localStorage.setItem(this.THEME_KEY, this.isDark() ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    this.isDark.update(dark => !dark);
  }

  private applyTheme() {
    if (this.isDark()) {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  }

  private getSavedTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(this.THEME_KEY);
    // Optional: respect system preference if no saved value
    if (!saved) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return saved as 'light' | 'dark';
  }
}