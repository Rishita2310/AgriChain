import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeSettings({ settings, setSettings }) {
  if (!settings) return null;

  const THEMES = [
    { id: 'light', label: 'Light Theme', icon: Sun, bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
    { id: 'dark', label: 'Dark Theme', icon: Moon, bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-800' },
    { id: 'system', label: 'System Default', icon: Monitor, bg: 'bg-gradient-to-br from-white to-gray-900', text: 'text-gray-500', border: 'border-gray-300' }
  ];

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Theme Settings</h2>
        <p className="text-gray-500 mt-1">Personalize the application's appearance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {THEMES.map((t) => {
          const Icon = t.icon;
          const isActive = settings.theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSettings({ ...settings, theme: t.id })}
              className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-200 ${
                isActive 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-105 z-10' 
                  : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isActive && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full text-gray-900 flex items-center justify-center border-4 border-white">
                  <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${t.bg} ${t.border} border`}>
                <Icon className={`w-8 h-8 ${t.text === 'text-white' ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <p className={`font-bold ${isActive ? 'text-primary' : 'text-gray-700'}`}>{t.label}</p>
            </button>
          );
        })}
      </div>
      
      {/* Live Preview Card */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Live Preview</p>
        <div className={`w-full max-w-sm rounded-xl p-4 shadow-sm transition-colors duration-500 border ${
          settings.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
            }`}>
              U
            </div>
            <div>
              <p className={`text-sm font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>User Profile</p>
              <p className={`text-xs ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Demo Account</p>
            </div>
          </div>
          <div className={`h-24 rounded-lg flex items-center justify-center font-medium text-sm border border-dashed ${
            settings.theme === 'dark' ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'
          }`}>
            Dashboard Card Preview
          </div>
        </div>
      </div>
    </div>
  );
}
