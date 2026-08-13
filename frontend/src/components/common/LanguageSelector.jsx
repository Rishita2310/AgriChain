import React, { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'zh-CN', name: 'Chinese', native: '中文' },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Init Google Translate
    const initTranslate = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        const container = document.getElementById('google_translate_element');
        if (container && container.innerHTML === '') {
          new window.google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element'
          );
        }
      }
    };

    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = initTranslate;
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      initTranslate();
    }
    
    // Attempt to read current language from cookie to persist state
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match) {
        const langCode = match[2].split('/').pop();
        if (langCode && langCode !== 'en') {
            setCurrentLang(langCode);
        }
    }
  }, []);

  const handleLanguageSelect = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Find the hidden Google Translate select element and trigger change
    const selectEl = document.querySelector('.goog-te-combo');
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const activeLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden container for Google Translate widget */}
      <div id="google_translate_element" className="hidden"></div>

      {/* Custom Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 ${
          isOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50/50 hover:bg-gray-100/80 border-gray-100 text-gray-700'
        }`}
      >
        <Globe className={`w-4 h-4 ${isOpen ? 'text-emerald-600' : 'text-gray-500'}`} />
        <span className="text-xs font-bold">{activeLang.name}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Custom Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[100]"
          >
            <div className="p-2 max-h-[320px] overflow-y-auto custom-scrollbar">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-sm ${
                    currentLang === lang.code 
                      ? 'bg-emerald-50 text-emerald-700 font-bold' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{lang.name}</span>
                    <span className={`text-[10px] ${currentLang === lang.code ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {lang.native}
                    </span>
                  </div>
                  {currentLang === lang.code && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}