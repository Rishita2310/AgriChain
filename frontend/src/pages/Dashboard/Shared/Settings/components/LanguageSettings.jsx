import React from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  'English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 
  'Kannada', 'Malayalam', 'Bengali', 'Punjabi', 'Spanish', 
  'French', 'Arabic', 'Chinese'
];

export default function LanguageSettings({ settings, setSettings }) {
  if (!settings) return null;

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Language Settings</h2>
        <p className="text-gray-500 mt-1">Choose your preferred application language.</p>
      </div>

      <div className="max-w-md bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" /> Current Language
        </label>
        
        <select 
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-gray-900 appearance-none shadow-sm cursor-pointer"
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        
        <p className="text-xs text-gray-500 mt-4 leading-relaxed font-medium">
          Selecting a new language will instantly localize the UI across your dashboard, marketplace, and settings menus. 
          RTL support is automatically applied for supported languages.
        </p>
      </div>
    </div>
  );
}
