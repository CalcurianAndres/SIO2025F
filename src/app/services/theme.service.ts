import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  initTheme() {
    const color = localStorage.getItem('primaryColor');
    if (color) {
      document.documentElement.style.setProperty('--primary-color', color);
    }
  }

  setPrimary(color: string) {
    localStorage.setItem('primaryColor', color);
    document.documentElement.style.setProperty('--primary-color', color);
  }

  getPrimary() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color')
      .trim();
  }
}
