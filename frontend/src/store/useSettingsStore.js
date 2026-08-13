import { create } from 'zustand';
import { settingsService } from '../services/settings.service';
import i18n from '../i18n/config';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const data = await settingsService.getSettings();
      set({ settings: data, loading: false });
      get().applySettings(data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
      set({ loading: false });
    }
  },

  updateSettingsLocally: (newSettings) => {
    set({ settings: newSettings });
    get().applySettings(newSettings);
  },

  applySettings: (settings) => {
    if (!settings) return;

    // Apply Theme
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply Language
    const langMap = {
      'English': 'en',
      'Hindi': 'hi',
      'Gujarati': 'gu',
      'Marathi': 'mr',
      'Tamil': 'ta',
      'Telugu': 'te',
      'Kannada': 'kn',
      'Malayalam': 'ml',
      'Bengali': 'bn',
      'Punjabi': 'pa',
      'Spanish': 'es',
      'French': 'fr',
      'Arabic': 'ar',
      'Chinese': 'zh-CN'
    };
    
    const targetLang = langMap[settings.language] || 'en';
    root.lang = targetLang;
    
    // Update i18next
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(targetLang);
    }
    
    // Update Google Translate widget if available
    const selectEl = document.querySelector('.goog-te-combo');
    if (selectEl && selectEl.value !== targetLang) {
      selectEl.value = targetLang;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}));
