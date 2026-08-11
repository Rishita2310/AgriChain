import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Fingerprint, Box, MapPin, ExternalLink, Download } from 'lucide-react';

export default function SuccessScreen({ orderResponse, product }) {
  const navigate = useNavigate();

  if (!orderResponse) return null;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-white"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Payment Successfully Locked</h1>
          <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
            Your funds are safely secured in blockchain escrow. The farmer has been notified and the order status is now <span className="font-semibold text-yellow-600">Waiting for Farmer</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10 max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-3">
              <Box className="w-6 h-6 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Details</div>
                <div className="font-semibold text-gray-900">{orderResponse.order_id}</div>
                <div className="text-sm text-gray-600 mt-1">Total Paid: ₹{orderResponse.total_paid.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-start gap-3">
              <Fingerprint className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Blockchain Record</div>
                <div className="font-mono text-sm text-gray-900 break-all">{orderResponse.blockchain_tx_hash.slice(0, 24)}...</div>
                <div className="text-xs text-blue-600 font-medium mt-1">Verified on Arbitrum</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-3 md:col-span-2">
              <MapPin className="w-6 h-6 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expected Delivery</div>
                <div className="font-semibold text-gray-900">{new Date(orderResponse.expected_delivery).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/buyer/orders')}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
            >
              View Order Dashboard
            </button>
            <button 
              onClick={() => navigate('/buyer/marketplace')}
              className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
          </div>
          
          <button className="mt-8 text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2 mx-auto">
            <Download className="w-4 h-4" /> Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
