import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, ShieldCheck, Wallet, Lock, TrendingUp, Globe2, 
  Cpu, ScanLine, Languages, PackageCheck, LineChart, Sparkles, CheckCircle2 
} from 'lucide-react';
import axios from '@/services/api';

const defaultFeatures = [
  { id: 1, title: "Direct Farmer-to-Buyer Trading", category: "Marketplace", description: "Connect directly with verified wholesale buyers without intermediaries taking cuts.", icon: Link2 },
  { id: 2, title: "Smart Contract Escrow", category: "Web3 Security", description: "Payments are locked securely on Arbitrum and auto-released on verified delivery.", icon: Lock },
  { id: 3, title: "AI Price & Mandi Predictions", category: "AI Intelligence", description: "Predict future harvest prices and seasonal market demand with machine learning.", icon: TrendingUp },
  { id: 4, title: "Immutable Crop Provenance", category: "Traceability", description: "Generate QR codes certifying crop origin, organic status, and harvest timestamp.", icon: ScanLine },
  { id: 5, title: "Integrated Web3 Wallet", category: "Finances", description: "Manage testnet crypto or local fiat earnings seamlessly with instant withdrawals.", icon: Wallet },
  { id: 6, title: "End-to-End Delivery Tracking", category: "Logistics", description: "Real-time state tracking from farm packing to courier shipment and final receipt.", icon: PackageCheck },
  { id: 7, title: "Multi-Language Support", category: "Accessibility", description: "Trade effortlessly in your local native language including Hindi, Punjabi, and English.", icon: Languages },
  { id: 8, title: "Automated Dispute Resolution", category: "Governance", description: "Decentralized arbitrations protect both farmers and buyers with escrow guarantees.", icon: ShieldCheck },
];

export default function Features() {
  const [features, setFeatures] = useState(defaultFeatures);

  useEffect(() => {
    axios.get('/features')
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Can map custom features if available
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs mb-3 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Everything you need to trade securely
          </h2>
          <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed">
            AgriChain blends decentralized smart contracts with real-world agricultural commerce to create a trusted, highly transparent trading hub.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-50/70 hover:bg-white rounded-3xl p-6 border border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-600/5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors">
                      {feature.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-gray-900 mb-2.5 group-hover:text-emerald-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-emerald-600 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Production Ready</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}