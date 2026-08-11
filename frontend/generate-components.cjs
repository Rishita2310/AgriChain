const fs = require('fs');
const path = require('path');

const files = {
    'src/components/common/LanguageSelector.jsx': `
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
`,
    'src/components/layout/Navbar.jsx': `
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Wallet } from 'lucide-react';
import LanguageSelector from '../common/LanguageSelector';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={\`fixed w-full z-50 transition-all duration-300 \${isScrolled ? 'glass py-3' : 'bg-transparent py-5'}\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">AgriChain</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('nav.home')}</a>
            <a href="#features" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('nav.features')}</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('nav.how_it_works')}</a>
            <a href="#testimonials" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('nav.testimonials')}</a>
            <a href="#faq" className="text-gray-700 hover:text-primary font-medium transition-colors">{t('nav.faq')}</a>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <LanguageSelector />
            <button className="flex items-center text-gray-700 hover:text-primary font-medium transition-colors">
              <Wallet className="w-5 h-5 mr-2" />
              {t('nav.wallet')}
            </button>
            <button className="text-primary hover:text-primary-dark font-medium transition-colors">{t('nav.login')}</button>
            <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              {t('nav.get_started')}
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 hover:text-primary">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full flex flex-col items-center py-4 space-y-4">
          <a href="#home" className="text-gray-700 font-medium">{t('nav.home')}</a>
          <a href="#features" className="text-gray-700 font-medium">{t('nav.features')}</a>
          <LanguageSelector />
          <button className="bg-primary text-white px-6 py-2 rounded-full font-medium shadow-md">
            {t('nav.get_started')}
          </button>
        </div>
      )}
    </nav>
  );
}
`,
    'src/components/layout/Footer.jsx': `
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <span className="text-2xl font-bold text-primary mb-4 block">AgriChain</span>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering global agriculture with transparent, secure, and fast blockchain technology.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary">About Us</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary">Help Center</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>support@agrichain.com</li>
              <li>+1 (555) 123-4567</li>
              <li>Global HQ, New York</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} AgriChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
`,
    'src/components/landing/Hero.jsx': `
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Globe2, ShieldCheck, Sprout } from 'lucide-react';
import axios from 'axios';

export default function Hero() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ farmers: 10000, buyers: 2500, transactions: 50000, countries: 15 });

  useEffect(() => {
    // Attempt to fetch real stats, fallback if fails
    axios.get('http://localhost:3000/api/statistics')
      .then(res => {
        if(res.data) setStats(res.data);
      })
      .catch(err => console.log("Using fallback stats"));
  }, []);

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
      {/* Background graphic elements */}
      <div className="absolute inset-0 bg-background z-0"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Blockchain Verified Marketplace</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Empowering <span className="text-primary relative">
                Farmers
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="transparent"/>
                </svg>
              </span><br/>Through Blockchain
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-semibold transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                {t('nav.get_started')} <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-lg">
                {t('hero.learn_more')}
              </button>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.farmers}+</div>
                <div className="text-sm text-gray-500 font-medium">{t('hero.stats_farmers')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.buyers}+</div>
                <div className="text-sm text-gray-500 font-medium">{t('hero.stats_buyers')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">100+</div>
                <div className="text-sm text-gray-500 font-medium">{t('hero.stats_markets')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.countries}+</div>
                <div className="text-sm text-gray-500 font-medium">{t('hero.stats_countries')}</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex-1 relative w-full"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100 aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10"></div>
                {/* Simulated App Dashboard Graphic */}
                <div className="absolute inset-4 bg-white/60 backdrop-blur-md rounded-xl border border-white p-6 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
                      <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                   </div>
                   <div className="flex-1 flex flex-col gap-4">
                      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                          <Sprout className="w-12 h-12 text-primary opacity-50" />
                      </div>
                      <div className="flex gap-4">
                        <div className="h-24 flex-1 bg-gray-100 rounded-lg"></div>
                        <div className="h-24 flex-1 bg-gray-100 rounded-lg"></div>
                      </div>
                      <div className="h-16 w-full bg-accent/20 rounded-lg mt-auto border border-accent/30 flex items-center px-4">
                        <div className="h-4 w-1/2 bg-accent/40 rounded"></div>
                      </div>
                   </div>
                </div>
            </div>
            
            {/* Floating badges */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-6 top-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Smart Contract</div>
                <div className="text-sm font-bold text-gray-900">Executed</div>
              </div>
            </motion.div>
            
          </motion.div>
        </div>
      </div>
    </section>
  );
}
`,
    'src/components/landing/Features.jsx': `
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ShieldCheck, Wallet, Lock, TrendingUp, Globe2, Cpu, ScanLine, Languages, PackageCheck, LineChart } from 'lucide-react';
import axios from 'axios';

const defaultFeatures = [
  { id: 1, title: "Direct Farmer to Buyer Trading", description: "Connect directly with trusted buyers globally.", icon: Link2 },
  { id: 2, title: "Blockchain Transparency", description: "Immutable records of transactions.", icon: ShieldCheck },
  { id: 3, title: "Digital Wallet", description: "Manage funds securely.", icon: Wallet },
  { id: 4, title: "Secure Payments", description: "Smart contract enabled payments.", icon: Lock },
  { id: 5, title: "AI Price Prediction", description: "Forecast market trends accurately.", icon: TrendingUp },
  { id: 6, title: "Real-Time Marketplace", description: "Live commodity prices and bids.", icon: Globe2 },
  { id: 7, title: "Smart Contracts", description: "Automated trustless execution.", icon: Cpu },
  { id: 8, title: "QR Verification", description: "Trace product journey.", icon: ScanLine },
  { id: 9, title: "Multilingual Support", description: "Trade in your native language.", icon: Languages },
  { id: 10, title: "Global Trading", description: "Export worldwide seamlessly.", icon: Globe2 },
  { id: 11, title: "Supply Chain Tracking", description: "End-to-end visibility.", icon: PackageCheck },
  { id: 12, title: "Analytics Dashboard", description: "Data-driven decisions.", icon: LineChart },
];

export default function Features() {
  const [features, setFeatures] = useState(defaultFeatures);

  useEffect(() => {
    axios.get('http://localhost:3000/api/features')
      .then(res => {
        if(res.data && res.data.length > 0) {
           // We could map API data to icons if provided, otherwise stick to default for visuals
        }
      })
      .catch(err => console.log("Using default features"));
  }, []);

  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">Platform Capabilities</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to trade securely</h3>
          <p className="text-gray-600 text-lg">AgriChain combines modern technology with agriculture to provide a seamless, secure, and transparent trading experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-background rounded-2xl p-6 border border-gray-100 hover:border-primary/30 transition-all hover:shadow-xl group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,
    'src/components/landing/HowItWorks.jsx': `
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle2, ListPlus, Inbox, Handshake, Link, Truck, PartyPopper } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: "Register Account", desc: "Create a free profile" },
  { icon: CheckCircle2, title: "Verification", desc: "KYC for security" },
  { icon: ListPlus, title: "List Products", desc: "Add your harvest" },
  { icon: Inbox, title: "Receive Offers", desc: "Buyers send bids" },
  { icon: Handshake, title: "Accept Best", desc: "Choose your price" },
  { icon: Link, title: "Blockchain Pay", desc: "Smart contract locked" },
  { icon: Truck, title: "Delivery", desc: "Ship to buyer" },
  { icon: PartyPopper, title: "Completed", desc: "Funds released" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How AgriChain Works</h2>
          <p className="text-gray-600">A simple, secure, and transparent process from farm to table.</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-primary origin-left -translate-y-1/2 z-0" style={{ transform: 'scaleX(0.5)' }}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative"
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 border border-primary/20">
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Step {idx + 1}</div>
                <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`,
    'src/components/landing/Testimonials.jsx': `
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import axios from 'axios';

const defaultTestimonials = [
  { id: 1, name: "Arjun Singh", role: "Wheat Farmer", country: "India", rating: 5, text: "AgriChain completely transformed how I sell my wheat. No middlemen, direct payment, and totally secure.", image: "https://i.pravatar.cc/150?img=11" },
  { id: 2, name: "Maria Garcia", role: "Coffee Exporter", country: "Colombia", rating: 5, text: "The international trading features and multilingual support make exporting coffee seamless and profitable.", image: "https://i.pravatar.cc/150?img=5" },
  { id: 3, name: "David Chen", role: "Wholesale Buyer", country: "Singapore", rating: 4, text: "Blockchain verification guarantees the origin of the produce. I can trust what I am buying.", image: "https://i.pravatar.cc/150?img=8" },
  { id: 4, name: "Sarah Johnson", role: "Cooperative Manager", country: "USA", rating: 5, text: "Our entire cooperative now uses the platform. The analytics dashboard is incredible.", image: "https://i.pravatar.cc/150?img=9" },
  { id: 5, name: "Ahmed Ali", role: "Date Farmer", country: "Egypt", rating: 5, text: "Smart contracts give me peace of mind. I know I will get paid the moment my delivery is confirmed.", image: "https://i.pravatar.cc/150?img=12" },
  { id: 6, name: "Elena Rostova", role: "Grain Buyer", country: "Russia", rating: 4, text: "Excellent platform. The UI is incredibly fast and responsive.", image: "https://i.pravatar.cc/150?img=28" }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by thousands globally</h2>
          <p className="text-gray-600">See what our community has to say about AgriChain.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-1/2 -left-12 -translate-y-1/2 z-10 hidden md:block">
            <button onClick={prev} className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute top-1/2 -right-12 -translate-y-1/2 z-10 hidden md:block">
            <button onClick={next} className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-hidden px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-background rounded-3xl p-8 md:p-12 border border-gray-100 relative shadow-xl shadow-primary/5"
              >
                <Quote className="absolute top-8 right-8 w-16 h-16 text-primary/10 rotate-180" />
                <div className="flex text-accent mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed mb-8 relative z-10">
                  "{testimonials[currentIndex].text}"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonials[currentIndex].image} 
                    alt={testimonials[currentIndex].name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h5 className="font-bold text-gray-900">{testimonials[currentIndex].name}</h5>
                    <p className="text-sm text-gray-500">{testimonials[currentIndex].role}, {testimonials[currentIndex].country}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={\`w-2.5 h-2.5 rounded-full transition-colors \${idx === currentIndex ? 'bg-primary' : 'bg-gray-300'}\`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`,
    'src/components/landing/FAQ.jsx': `
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: "How does blockchain help farmers?", a: "Blockchain provides a transparent, immutable ledger. Every transaction is recorded, ensuring farmers get fair prices, instant secure payments via smart contracts, and proof of origin for their produce." },
  { q: "Is wallet mandatory?", a: "Yes, a digital wallet is required to securely hold your funds, interact with smart contracts, and receive payments directly without bank delays." },
  { q: "Can I sell internationally?", a: "Absolutely! AgriChain connects you with global buyers. Our platform handles currency conversions and compliance seamlessly." },
  { q: "How are payments secured?", a: "Payments are locked into a Smart Contract when a deal is agreed upon. Funds are automatically released to the farmer only when delivery is verified." },
  { q: "How does buyer verification work?", a: "All buyers undergo a strict KYC (Know Your Customer) and AML (Anti-Money Laundering) verification process before they can place bids." },
  { q: "Can I use local currency?", a: "Yes, you can view prices and withdraw funds in your local fiat currency, though the underlying settlement may utilize stablecoins." },
  { q: "Can I access from mobile?", a: "Yes, AgriChain is fully responsive and optimized for all mobile devices, tablets, and desktops." }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about AgriChain.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={\`bg-white rounded-2xl border transition-all \${openIndex === index ? 'border-primary shadow-md' : 'border-gray-100 hover:border-gray-200'}\`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
              >
                <span className="font-semibold text-gray-900 text-lg">{faq.q}</span>
                <span className={\`ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors \${openIndex === index ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}\`}>
                  {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed pt-2 border-t border-gray-50 mx-6">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,
    'src/components/landing/CallToAction.jsx': `
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CallToAction() {
  const { t } = useTranslation();
  
  return (
    <section className="py-24 relative overflow-hidden bg-primary">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('cta.headline')}
          </h2>
          <p className="text-primary-light/90 text-white/80 text-xl mb-10 max-w-2xl mx-auto">
            Join the decentralized agricultural revolution today. Fast, secure, and transparent.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              {t('cta.create_account')}
            </button>
            <button className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              {t('cta.explore_marketplace')}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
`,
    'src/pages/Home/index.jsx': `
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import Testimonials from '../../components/landing/Testimonials';
import FAQ from '../../components/landing/FAQ';
import CallToAction from '../../components/landing/CallToAction';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>AgriChain | Blockchain Agricultural Marketplace</title>
        <meta name="description" content="Connect directly with trusted buyers, eliminate unnecessary middlemen, receive transparent payments, and trade securely using blockchain technology." />
        <meta property="og:title" content="AgriChain | Blockchain Agricultural Marketplace" />
        <meta property="og:description" content="Global agricultural trading platform powered by blockchain." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://agrichain.com" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </div>
    </>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim());
}
console.log("Components created");
