import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Lock, Eye, Database, Share2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 sm:py-24 relative overflow-hidden">
      <Helmet>
        <title>Privacy Policy - AgriChain</title>
      </Helmet>

      {/* Ambient background decoration */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-[100px] translate-y-1/3 translate-x-1/4 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            We are committed to protecting your personal information and your right to privacy in a decentralized ecosystem.
          </p>
          <p className="text-sm text-gray-400 mt-4">Last Updated: August 13, 2026</p>
        </motion.div>

        {/* Content container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white p-8 md:p-12 lg:p-16"
        >
          
          <div className="prose prose-lg prose-blue max-w-none text-gray-600">
            
            <section className="mb-12">
              <p className="leading-relaxed text-lg">
                Thank you for choosing to be part of our community at AgriChain. We are committed to protecting your personal information and your right to privacy. When you visit our platform and use our services, you trust us with your personal data. We take this responsibility very seriously.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-blue-500" /> 
                1. Information We Collect
              </h2>
              
              <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">1.1 Personal Information Provided by You</h3>
              <p className="leading-relaxed mb-4">
                We collect personal information that you voluntarily provide to us when you register on the Platform, express an interest in obtaining information about us or our products, or otherwise when you contact us. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong className="text-gray-800">Identity Data:</strong> Full name, farm name, government-issued ID (for verification), and profile photographs.</li>
                <li><strong className="text-gray-800">Contact Data:</strong> Email address, phone number, and physical delivery/farm addresses.</li>
                <li><strong className="text-gray-800">Financial Data:</strong> Web3 Wallet Addresses (e.g., Ethereum/Arbitrum public addresses). Note: We never ask for or store your private keys.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">1.2 Decentralized Blockchain Data</h3>
              <p className="leading-relaxed mb-4">
                Due to the public nature of blockchain technology, transactions conducted via our smart contracts are recorded on a public, immutable ledger (e.g., Arbitrum). Information regarding your wallet address, transaction amounts, and timestamps are publicly visible. You acknowledge that blockchain data cannot be erased or modified.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-blue-500" /> 
                2. How We Use Your Information
              </h2>
              <p className="leading-relaxed mb-4">
                We use personal information collected via our Platform for a variety of business purposes described below:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>To facilitate account creation and verification.</strong></li>
                <li><strong>To deliver services to you:</strong> We use your information to facilitate direct transactions between farmers and buyers.</li>
                <li><strong>To protect our Services:</strong> We use your information as part of our efforts to keep our Platform safe and secure (for example, for fraud monitoring and prevention).</li>
                <li><strong>To enforce our smart contracts:</strong> Assisting in dispute resolutions through the decentralized arbitration protocol.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Share2 className="w-6 h-6 text-blue-500" /> 
                3. Information Sharing and Disclosure
              </h2>
              <p className="leading-relaxed mb-4">
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Counterparties:</strong> When a buyer and farmer enter into a smart contract, necessary delivery information (name, phone, address) is securely shared between the two parties to facilitate shipping.</li>
                <li><strong>Logistics Partners:</strong> Delivery details may be shared with integrated third-party logistics and courier companies.</li>
                <li><strong>Public Blockchain:</strong> Transaction metadata, including wallet addresses and order hashes, are permanently written to the public blockchain.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <ShieldAlert className="w-6 h-6 text-blue-500" /> 
                4. Data Security
              </h2>
              <p className="leading-relaxed">
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure. You should only access the Platform within a secure environment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. Your Privacy Rights
              </h2>
              <p className="leading-relaxed">
                In some regions (like the EEA, UK, and CCPA in California), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information. To make such a request, please contact our Data Protection Officer at privacy@agrichain.network. Note that due to the nature of blockchain technology, we cannot erase data that has been published to a decentralized ledger.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
