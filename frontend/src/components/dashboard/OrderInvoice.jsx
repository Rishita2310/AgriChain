import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Receipt, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';

export default function OrderInvoice({ order, role }) {
  if (!order) return null;

  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const explorerUrl = order.blockchain_release_tx_hash 
    ? `https://sepolia.arbiscan.io/tx/${order.blockchain_release_tx_hash}`
    : order.blockchain_tx_hash
      ? `https://sepolia.arbiscan.io/tx/${order.blockchain_tx_hash}`
      : 'https://sepolia.arbiscan.io';

  const payment = order.payment || {};
  const totalAmount = payment.total || order.total_amount || 0;
  
  const handleDownload = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    const loadingToast = toast.loading('Generating Secure PDF...');
    
    const opt = {
      margin:       0,
      filename:     `AgriChain_Invoice_${order.order_id?.substring(0,8).toUpperCase()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      toast.dismiss(loadingToast);
      toast.success('Invoice downloaded successfully!');
    }).catch((err) => {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate PDF');
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
      <button 
        id="download-invoice-btn"
        onClick={handleDownload}
        className="no-print px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Receipt className="w-5 h-5" />
        Download Professional Invoice
      </button>

      {/* Wrapping with motion div but inner div has id="invoice-content" */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl border border-gray-200 w-[210mm] mx-auto overflow-hidden font-sans text-gray-900"
      >
        <div id="invoice-content" className="w-[210mm] bg-white p-[15mm]">
          
          {/* Top Header - Company Info & Invoice Title */}
          <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-emerald-800 tracking-tight uppercase">AGRICHAIN</h1>
              <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mt-1">Decentralized Exchange</p>
              <div className="mt-4 text-sm text-gray-600 leading-relaxed">
                <p className="font-semibold">AgriChain Network Ltd.</p>
                <p>Global Web3 Agriculture Hub</p>
                <p>Blockchain Valley, Earth</p>
                <p className="text-emerald-700">support@agrichain.network</p>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-4xl font-light text-gray-400 uppercase tracking-widest mb-4">Invoice</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 text-left">
                <span className="font-bold">Invoice No:</span>
                <span className="text-right uppercase">{order.order_id?.substring(0, 8)}</span>
                
                <span className="font-bold">Invoice Date:</span>
                <span className="text-right">{formattedDate}</span>
                
                <span className="font-bold">Order Time:</span>
                <span className="text-right">{formattedTime}</span>

                <span className="font-bold mt-2">Payment Status:</span>
                <span className="text-right mt-2 font-bold text-emerald-600">PAID</span>
              </div>
            </div>
          </div>

          {/* Billed To / Shipped To */}
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Billed To (Buyer)</h3>
              <p className="font-bold text-lg text-gray-900">{order.delivery_address?.full_name || 'Verified Buyer'}</p>
              <p className="text-sm text-gray-600 mt-1">{order.delivery_address?.phone_number}</p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {order.delivery_address?.address_line1},<br />
                {order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pin_code}
              </p>
              <div className="mt-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Wallet Address:</span>
                <p className="text-xs font-mono text-gray-600 break-all">{order.buyer_wallet}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Supplied By (Farmer)</h3>
              <p className="font-bold text-lg text-gray-900">AgriChain Verified Cultivator</p>
              <p className="text-sm text-gray-600 mt-1">Authorized Agricultural Partner</p>
              <div className="mt-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Seller Wallet ID:</span>
                <p className="text-xs font-mono text-gray-600 break-all">{order.farmer_id}</p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8 border border-gray-300 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/50 border-b border-gray-300">
                  <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Item Description</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider text-center">Qty</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider text-right">Unit Price</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900 text-sm">{order.product_name || 'Premium Agricultural Produce'}</p>
                    <p className="text-xs text-gray-500 mt-1">Item ID: {order.product_id?.substring(0, 12)}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium text-gray-900 text-sm">{order.quantity} {order.unit || 'kg'}</span>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-700 text-sm">
                    ₹{payment.product_price ? (payment.product_price / order.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2}) : '-'}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900 text-sm">
                    ₹{(payment.product_price || totalAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Summary & QR Code */}
          <div className="flex justify-between items-start mb-12">
            <div className="w-1/2 pr-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Blockchain Verification</h3>
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <div className="bg-white p-2 rounded-md border border-gray-200 shrink-0">
                  <QRCodeSVG value={explorerUrl} size={80} level="M" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    Scan QR to verify this transaction on Arbitrum Sepolia Explorer. 
                    Secured via decentralized escrow smart contracts.
                  </p>
                  <p className="text-[10px] font-mono text-gray-500 break-all bg-white border border-gray-200 p-1.5 rounded">
                    TX: {order.blockchain_tx_hash || 'Pending Confirmation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-[40%]">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{(payment.product_price || totalAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee:</span>
                  <span className="font-medium">₹{(payment.platform_fee || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge:</span>
                  <span className="font-medium">₹{(payment.delivery_charge || payment.delivery_fee || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                
                <div className="h-px bg-gray-300 w-full my-2" />
                
                <div className="flex justify-between text-lg font-black text-gray-900 items-center">
                  <span>Grand Total:</span>
                  <span>₹{totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 mt-12 border-t border-gray-200">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">AgriChain Authenticated</span>
            </div>
            <p className="text-center text-xs text-gray-500">
              System generated invoice. This document serves as cryptographic proof of purchase secured via Arbitrum Sepolia blockchain. No physical signature required.
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
