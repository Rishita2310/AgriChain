import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 sm:py-24 relative overflow-hidden">
      <Helmet>
        <title>Terms of Service - AgriChain</title>
      </Helmet>

      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Please read these terms carefully before using the AgriChain platform. By accessing or using our services, you agree to be bound by these terms.
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
          
          <div className="prose prose-lg prose-green max-w-none text-gray-600">
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-green-500" /> 
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing, browsing, or using the AgriChain decentralized agricultural marketplace (the "Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (the "Terms"). If you do not agree to these Terms, please do not use the Platform. AgriChain operates as a peer-to-peer network utilizing blockchain technology to connect farmers directly with buyers, facilitating secure smart-contract based transactions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-green-500" /> 
                2. User Roles and Responsibilities
              </h2>
              
              <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">2.1 Farmers (Sellers)</h3>
              <p className="leading-relaxed mb-4">
                As a Farmer on AgriChain, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Provide accurate, current, and honest representations of the agricultural products you list.</li>
                <li>Ensure all products meet local and national agricultural safety standards.</li>
                <li>Honor the prices and quantities listed at the time of smart contract execution.</li>
                <li>Ensure timely shipping and provide accurate tracking information when applicable.</li>
                <li>Acknowledge that payment will be held in a decentralized escrow smart contract until the buyer confirms delivery.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">2.2 Buyers</h3>
              <p className="leading-relaxed mb-4">
                As a Buyer on AgriChain, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fund your Web3 wallet (e.g., MetaMask) with sufficient cryptocurrency to cover product costs and network gas fees.</li>
                <li>Promptly confirm delivery upon receiving the goods in satisfactory condition, triggering the release of funds from the escrow contract to the Farmer.</li>
                <li>Refrain from making false claims regarding non-delivery or damaged goods to manipulate the escrow system.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-green-500" /> 
                3. Decentralized Escrow and Smart Contracts
              </h2>
              <p className="leading-relaxed mb-4">
                AgriChain leverages Arbitrum and Ethereum-compatible smart contracts to facilitate trustless transactions. When an order is placed, the buyer's funds are locked in an immutable escrow contract.
              </p>
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 my-6 text-orange-900">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Important Notice Regarding Blockchain Transactions
                </h4>
                <p className="text-sm leading-relaxed">
                  Blockchain transactions are irreversible. Once a smart contract is executed and funds are transferred, AgriChain administrators cannot reverse the transaction, refund the cryptocurrency, or recover lost private keys. Users are solely responsible for the security of their digital wallets and the accuracy of their transaction approvals.
                </p>
              </div>
              <p className="leading-relaxed">
                In the event of a dispute (e.g., damaged goods, non-delivery), users must initiate the decentralized dispute resolution protocol within the timeframe specified in the smart contract. A randomly selected pool of verified community arbiters will review the evidence and vote to distribute the locked funds accordingly.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. Fees and Platform Economics
              </h2>
              <p className="leading-relaxed">
                AgriChain charges a minimal platform fee (typically 1-2%) on successful transactions to maintain infrastructure and fund the community treasury. Additionally, users are responsible for all network gas fees associated with interacting with the blockchain. AgriChain does not control gas prices, which fluctuate based on network congestion.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. Prohibited Activities
              </h2>
              <p className="leading-relaxed mb-4">
                Users are strictly prohibited from engaging in the following activities on the Platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Listing illegal, synthetic, or banned agricultural products.</li>
                <li>Engaging in wash trading, price manipulation, or creating fake reviews.</li>
                <li>Attempting to exploit, hack, or reverse-engineer the AgriChain smart contracts or backend infrastructure.</li>
                <li>Harassing, threatening, or defrauding other members of the community.</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Violation of these rules may result in immediate suspension of your account and blacklisting of your wallet address from interacting with AgriChain smart contracts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                6. Limitation of Liability
              </h2>
              <p className="leading-relaxed text-sm text-gray-500 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL AGRICHAIN, ITS FOUNDERS, DEVELOPERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THIS PLATFORM. THE PLATFORM AND SMART CONTRACTS ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
