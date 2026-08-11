import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Home, ChevronRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { productService } from '../../../../services/product.service';
import { orderService } from '../../../../services/order.service';
import OrderSummaryCard from './components/OrderSummaryCard';
import AddressSelection from './components/AddressSelection';
import PaymentSummary from './components/PaymentSummary';
import EscrowPaymentView from './components/EscrowPaymentView';
import SuccessScreen from './components/SuccessScreen';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQty = parseInt(searchParams.get('qty')) || 1;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout State
  const [step, setStep] = useState(1); // 1 = Review, 2 = Escrow
  const [quantity, setQuantity] = useState(initialQty);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Success State
  const [orderResponse, setOrderResponse] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(id);
        setProduct(data.product);
        if (data.product.quantity < initialQty) {
          setQuantity(data.product.quantity);
        }
      } catch (err) {
        toast.error("Failed to load product details");
        navigate('/buyer/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, initialQty, navigate]);

  const handleProceedToEscrow = (paymentMethod, total) => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = async (txHash) => {
    setIsProcessing(true);
    
    try {
      const orderPayload = {
        product_id: product.product_id,
        quantity: quantity,
        delivery_address: {
          full_name: selectedAddress.full_name,
          phone_number: selectedAddress.phone_number,
          address_line1: selectedAddress.address_line1,
          address_line2: selectedAddress.address_line2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country,
          pin_code: selectedAddress.pin_code,
          address_type: selectedAddress.address_type
        },
        payment_method: 'Wallet Escrow',
        coupon_code: coupon,
        blockchain_tx_hash: txHash
      };

      const response = await orderService.createOrder(orderPayload);
      setOrderResponse(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Order processing failed');
      setStep(1); // fallback
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">{isProcessing ? "Creating Secure Order..." : "Initializing Secure Checkout..."}</p>
      </div>
    );
  }

  if (orderResponse) {
    return <SuccessScreen orderResponse={orderResponse} product={product} />;
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-12 min-h-screen relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[50%] rounded-full bg-blue-300/10 blur-[100px] pointer-events-none" />

      {/* Breadcrumb */}
      <nav className="relative z-10 flex items-center gap-2 text-sm text-gray-500 font-medium mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <Link to="/buyer/marketplace" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
          <Home className="w-4 h-4" /> Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/buyer/marketplace" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/product/${product.product_id}`} className="hover:text-emerald-600 truncate max-w-[150px] transition-colors">{product.product_name}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-bold bg-white/50 px-2 py-1 rounded-md border border-gray-100 shadow-sm">{step === 1 ? 'Checkout' : 'Escrow Payment'}</span>
      </nav>

      {/* Header & Steps */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => step === 2 ? setStep(1) : navigate(-1)} 
            className="p-3 bg-white/50 border border-gray-200 rounded-full hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{step === 1 ? 'Review Order' : 'Escrow Payment'}</h1>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-bold tracking-wide">
           <span className={`px-4 py-2 rounded-full border transition-all duration-500 ${step === 1 ? 'bg-gray-900 text-white border-gray-900 shadow-[0_4px_15px_rgba(0,0,0,0.2)]' : 'bg-white/50 text-gray-400 border-gray-200'}`}>1. Details</span>
           <div className="w-8 h-px bg-gray-300"></div>
           <span className={`px-4 py-2 rounded-full border transition-all duration-500 ${step === 2 ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_15px_rgba(37,99,235,0.3)]' : 'bg-white/50 text-gray-400 border-gray-200'}`}>2. Pay & Lock</span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10"
          >
          <div className="flex-1">
            <OrderSummaryCard product={product} quantity={quantity} setQuantity={setQuantity} />
            <AddressSelection selectedAddress={selectedAddress} onSelectAddress={setSelectedAddress} />
          </div>
          <div className="w-full lg:w-[420px] shrink-0">
            {/* PaymentSummary */}
            <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white sticky top-24">
               <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Payment Summary</h3>
               
               <div className="space-y-3 text-sm text-gray-600 mb-8">
                 <div className="flex justify-between items-center pb-4 border-b border-gray-100/50">
                   <span className="font-medium">Product Total ({quantity} items)</span>
                   <span className="font-black text-gray-900 text-lg">₹{(product.price * quantity).toFixed(2)}</span>
                 </div>
               </div>

               <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleProceedToEscrow}
                 className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-900/20"
               >
                 Proceed to Escrow Payment
               </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="relative z-10"
        >
          <EscrowPaymentView 
            product={product}
            quantity={quantity}
            address={selectedAddress}
            coupon={coupon}
            onPaymentSuccess={handleConfirmOrder}
            onCancel={() => setStep(1)}
          />
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
