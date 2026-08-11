import React, { useState } from 'react';
import { Tag, ShieldCheck, CreditCard, Wallet, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentSummary({ product, quantity, coupon, setCoupon, onConfirm, loading }) {
  const [couponInput, setCouponInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Wallet Connected');

  const subtotal = product ? product.price * quantity : 0;
  const deliveryCharge = 60;
  const platformFee = 20;
  const gst = subtotal * 0.05;
  const discount = coupon === 'DISCOUNT50' ? 50 : 0;
  
  const total = subtotal + deliveryCharge + platformFee + gst - discount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.toUpperCase() === 'DISCOUNT50') {
      setCoupon('DISCOUNT50');
      toast.success('Discount Applied Successfully!');
    } else {
      toast.error('Invalid Coupon Code');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h3>
      
      <div className="space-y-3 text-sm text-gray-600 mb-6">
        <div className="flex justify-between">
          <span>Product Total ({quantity} items)</span>
          <span className="font-medium text-gray-900">₹{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Charge</span>
          <span className="font-medium text-gray-900">₹{deliveryCharge.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform Fee</span>
          <span className="font-medium text-gray-900">₹{platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (5%)</span>
          <span className="font-medium text-gray-900">₹{gst.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount Applied</span>
            <span>- ₹{discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <hr className="border-gray-100 mb-6" />

      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-900 font-bold">Grand Total</span>
        <span className="text-3xl font-extrabold text-green-700">₹{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
      </div>

      {/* Coupon Section */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Have a coupon?</label>
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="e.g. DISCOUNT50" 
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all uppercase"
            />
          </div>
          <button type="submit" className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Apply</button>
        </form>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setPaymentMethod('Wallet Connected')}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === 'Wallet Connected' ? 'border-green-500 bg-green-50/50 text-green-800' : 'border-gray-100 text-gray-600 hover:border-gray-200 bg-white'}`}
          >
            <Wallet className={`w-4 h-4 ${paymentMethod === 'Wallet Connected' ? 'text-green-600' : 'text-gray-400'}`} /> Wallet
          </button>
          <button 
            onClick={() => setPaymentMethod('UPI')}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === 'UPI' ? 'border-green-500 bg-green-50/50 text-green-800' : 'border-gray-100 text-gray-600 hover:border-gray-200 bg-white'}`}
          >
            <CreditCard className={`w-4 h-4 ${paymentMethod === 'UPI' ? 'text-green-600' : 'text-gray-400'}`} /> UPI/Card
          </button>
        </div>
        {paymentMethod === 'Wallet Connected' && (
          <div className="mt-3 bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex gap-3 text-sm">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="text-gray-700">
              <span className="font-semibold text-gray-900 block mb-0.5">Secure Smart Contract</span>
              Payment will be processed securely via Arbitrum Sepolia.
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => onConfirm(paymentMethod, total)}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        {loading ? (
          <>Processing Securely...</>
        ) : (
          <><Lock className="w-5 h-5" /> Confirm & Pay</>
        )}
      </button>
    </div>
  );
}
