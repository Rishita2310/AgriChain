import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'de', name: 'German' },
  { code: 'ru', name: 'Russian' }
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <div className="relative group flex items-center">
      <Globe className="w-5 h-5 text-gray-600 mr-2" />
      <select 
        className="appearance-none bg-transparent border-none text-gray-700 text-sm font-medium focus:ring-0 cursor-pointer outline-none"
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="text-gray-900">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}