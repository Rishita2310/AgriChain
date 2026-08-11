import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sprout, ShoppingBag, Lock, CheckCircle2, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '@/services/api';

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ farmers: 1250, buyers: 3400, transactions: 15000, countries: 12 });

  useEffect(() => {
    axios.get('/statistics')
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {
        // Keep resilient fallback stats
      });
  }, []);

  return (
    <section id="home" className="relative pt-28 pb-16 lg:pt-40 lg:pb-28 overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-b from-emerald-50/40 via-white to-gray-50/50">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-300/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-teal-200/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Trust Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 font-bold text-xs mb-6 border border-emerald-200/80 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Arbitrum Sepolia Verified Escrow</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.15] tracking-tight mb-6">
              {t('hero.headline_part1')} <span className="text-emerald-600 relative inline-block">
                {t('hero.headline_highlight')}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-400/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/>
                </svg>
              </span>
              <br />{t('hero.headline_part2')}
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t('hero.subtitle')}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-base transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
              >
                <span>{t('hero.get_started')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                to="/marketplace" 
                className="w-full sm:w-auto bg-white border border-gray-200 text-gray-800 hover:border-emerald-500 hover:text-emerald-700 px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>{t('hero.explore_marketplace')}</span>
              </Link>
            </div>
            
            {/* Live Platform Stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-gray-200/80">
              <div className="bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-2xl lg:text-3xl font-black text-gray-900">{stats.farmers}+</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">{t('hero.stats_farmers')}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-2xl lg:text-3xl font-black text-gray-900">{stats.buyers}+</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">{t('hero.stats_buyers')}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-2xl lg:text-3xl font-black text-emerald-600">100%</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">{t('hero.stats_protected')}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-2xl lg:text-3xl font-black text-gray-900">0%</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">{t('hero.stats_cuts')}</div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Interactive Mockup Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 relative w-full"
          >
            <div className="relative rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.12)] bg-white border border-gray-200/80 p-5 max-w-md mx-auto">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Live Harvest Trade</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Arbitrum Sepolia Block #48192</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Escrow Locked
                </span>
              </div>

              {/* Harvest Showcase */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative overflow-hidden shadow-md">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      Organic Certified
                    </span>
                    <h3 className="text-xl font-black mt-2 text-white">Sharbati Golden Wheat</h3>
                    <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> Punjab, India &bull; 500 Quintals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">$45.00</p>
                    <p className="text-[10px] text-emerald-200 font-bold">per quintal</p>
                  </div>
                </div>
              </div>

              {/* Provenance Steps */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-800">Soil Quality & Seed Verified</p>
                      <p className="text-[10px] text-gray-400">Purity Grade: 99.4%</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">Verified</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-800">Buyer Deposit in Smart Escrow</p>
                      <p className="text-[10px] text-gray-400">0.024 ETH Locked On-Chain</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">Secured</span>
                </div>
              </div>

              {/* AI Prediction preview */}
              <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-800">AI Price Forecast:</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +8.4% next 14 days
                </span>
              </div>
            </div>
            
            {/* Floating Live Badge */}
            <motion.div 
              animate={{ y: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-5 -left-4 sm:-left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                ⚡
              </div>
              <div>
                <div className="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider">Fast Settlement</div>
                <div className="text-xs font-black text-gray-900">&lt; 3 Seconds on Arbitrum</div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}