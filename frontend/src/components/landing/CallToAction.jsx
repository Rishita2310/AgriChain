import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Search, ShieldCheck, Sparkles, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CallToAction() {
  const { t } = useTranslation();
  
  return (
    <section className="py-24 relative overflow-hidden bg-gray-900 text-white">
      {/* Dynamic ambient gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-[36px] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl border border-emerald-500/30 text-center">
          
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white font-extrabold text-xs mb-6 border border-white/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Join 4,500+ AgriChain Traders</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-tight max-w-2xl mx-auto">
            Ready to revolutionize your agricultural trade?
          </h2>
          
          <p className="text-emerald-100 text-base sm:text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">
            Eliminate commission fees, receive guaranteed payments in escrow, and trade with verified global buyers in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/register"
              className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-4 rounded-2xl font-black text-base transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5 text-emerald-700" />
            </Link>
            <Link 
              to="/marketplace"
              className="w-full sm:w-auto bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Search className="w-5 h-5 text-emerald-300" />
              <span>Explore Marketplace</span>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> 100% Escrow Protection
            </span>
            <span className="flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-300" /> Verified Farm Produce
            </span>
            <span className="flex items-center gap-1.5">
              ⚡ Arbitrum Sepolia Speed
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}