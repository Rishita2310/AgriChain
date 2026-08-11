import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, QrCode, ArrowRight, Package, LayoutDashboard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ProductSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const productId = location.state?.productId || 'PRD-UNKNOWN';

  // The QR code value links to the product details page
  const productUrl = `${window.location.origin}/product/${productId}`;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Congratulations!</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Your product has been successfully published to the AgriChain network. It is now visible to verified buyers.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10 p-6 bg-gray-50 rounded-2xl mx-auto max-w-lg">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
             <QRCodeSVG value={productUrl} size={120} level="H" includeMargin={false} />
          </div>
          <div className="text-left space-y-2">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blockchain Product ID</div>
             <div className="font-mono text-gray-900 font-medium bg-gray-200 px-3 py-1 rounded-lg inline-block text-sm">
                {productId}
             </div>
             <p className="text-xs text-gray-500 mt-2 flex items-start gap-1 max-w-[200px]">
               <QrCode className="w-4 h-4 shrink-0 text-gray-400" />
               Buyers can scan this QR code to verify product authenticity and harvest details.
             </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/farmer/products')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Package className="w-4 h-4" /> View My Products
          </button>
          
          <button 
            onClick={() => navigate('/farmer/products/add')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark shadow-sm transition-colors"
          >
            Add Another Product <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-8">
          <Link to="/farmer/dashboard" className="text-sm font-medium text-gray-400 hover:text-primary flex items-center justify-center gap-1 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
