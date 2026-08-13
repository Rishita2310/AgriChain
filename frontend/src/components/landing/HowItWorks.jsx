import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, CheckCircle2, ListPlus, Inbox, Handshake, Lock, Truck, 
  PartyPopper, Search, CreditCard, ShieldAlert, ArrowRight, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const farmerSteps = [
  { step: "01", icon: UserPlus, title: "Connect Wallet & Register", desc: "Link your Web3 wallet (or email) and complete verified farmer identification in under 2 minutes." },
  { step: "02", icon: ListPlus, title: "List Harvest Batches", desc: "Set your crop quantity, base price, harvest date, and generate an on-chain provenance certificate." },
  { step: "03", icon: Lock, title: "Receive Escrow Lock", desc: "When a buyer orders, their full payment is locked securely in the Arbitrum Sepolia escrow contract." },
  { step: "04", icon: Truck, title: "Ship & Instant Payout", desc: "Dispatch the produce. Upon buyer receipt verification, funds are released directly to your wallet." },
];

const buyerSteps = [
  { step: "01", icon: Search, title: "Explore Verified Crops", desc: "Browse real-time listings with transparent prices, seller reputation ratings, and lab test certificates." },
  { step: "02", icon: CreditCard, title: "Deposit into Escrow", desc: "Purchase securely with crypto or test funds. Your money remains protected in escrow until you inspect delivery." },
  { step: "03", icon: Truck, title: "Live Transit Tracking", desc: "Track batch movement with timestamped logistics updates and automated dispatch notifications." },
  { step: "04", icon: PartyPopper, title: "Verify & Release Funds", desc: "Scan crop QR provenance, confirm quality, and release funds with one tap. Leave a blockchain rating." },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('farmer');

  const currentSteps = activeTab === 'farmer' ? farmerSteps : buyerSteps;

  return (
    <section id="how-it-works" className="py-24 bg-gray-50/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs mb-3 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
            How AgriChain Works
          </h2>
          <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed mb-8">
            A frictionless, decentralized journey designed specifically for agricultural trading.
          </p>

          {/* Interactive Role Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
            <button
              onClick={() => setActiveTab('farmer')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'farmer'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌾 For Farmers & Producers
            </button>
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'buyer'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🛒 For Wholesalers & Buyers
            </button>
          </div>
        </div>

        {/* Dynamic Stepped Flow */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {currentSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-2xl font-black text-gray-200 group-hover:text-emerald-300 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-gray-900 mb-2.5">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400 group-hover:text-emerald-700">
                    <span>Phase {idx + 1}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* CTA Strip */}
        <div className="mt-14 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}