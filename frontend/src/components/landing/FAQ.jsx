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
              className={`bg-white rounded-2xl border transition-all ${openIndex === index ? 'border-primary shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
              >
                <span className="font-semibold text-gray-900 text-lg">{faq.q}</span>
                <span className={`ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
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