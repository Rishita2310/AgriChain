import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, CheckCircle2, Factory, User, Clock, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderInvoice({ order, role }) {
  if (!order) return null;

  const isTerminal = ['Completed', 'Cancelled', 'Rejected'].includes(order.status);
  
  // Format dates securely
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate explorer URL for QR Code verification
  const explorerUrl = order.blockchain_release_tx_hash 
    ? `https://sepolia.arbiscan.io/tx/${order.blockchain_release_tx_hash}`
    : order.blockchain_tx_hash
      ? `https://sepolia.arbiscan.io/tx/${order.blockchain_tx_hash}`
      : 'https://sepolia.arbiscan.io';

  const payment = order.payment || {};
  const totalAmount = payment.total || order.total_amount || 0;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-invoice, .printable-invoice * {
              visibility: visible;
            }
            .printable-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              padding: 2cm !important;
              background-color: white !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
            /* Reset colors for printing */
            .printable-invoice .text-white { color: black !important; }
            .printable-invoice .bg-gray-900 { background: white !important; color: black !important; border: 1px solid #ccc; }
          }
        `}
      </style>

      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={handlePrint}
          className="no-print w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-4"
        >
          <ShieldCheck className="w-5 h-5" />
          Download Verified Bill (PDF)
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="printable-invoice bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-3xl overflow-hidden p-8 sm:p-12 relative"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Agri<span className="text-emerald-600">Chain</span></h1>
              </div>
              <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Decentralized Agricultural Exchange</p>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-4xl font-black text-gray-200 uppercase tracking-tighter mb-2">INVOICE</h2>
              <p className="text-sm font-bold text-gray-800">Order ID: <span className="font-mono text-emerald-600">{order.order_id?.substring(0, 12)}</span></p>
              <p className="text-sm text-gray-500 font-medium">Date: {formattedDate} {formattedTime}</p>
              <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-black uppercase tracking-widest border border-emerald-100">
                Status: {order.status}
              </div>
            </div>
          </div>

          {/* Billing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Billed To (Buyer)</h3>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">{order.delivery_address?.full_name || 'Buyer'}</p>
                  <p className="text-sm text-gray-600 mb-1">{order.delivery_address?.phone_number}</p>
                  <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                    {order.delivery_address?.address_line1}, {order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.pin_code}
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-2 break-all bg-gray-50 p-1.5 rounded">Wallet: {order.buyer_wallet}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Supplied By (Farmer)</h3>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">AgriChain Verified Cultivator</p>
                  <p className="text-[10px] font-mono text-gray-500 mt-2 break-all bg-emerald-50 p-1.5 rounded border border-emerald-100">Wallet: {order.farmer_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-10 rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Item Description</th>
                  <th className="py-3 px-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Quantity</th>
                  <th className="py-3 px-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Price</th>
                  <th className="py-3 px-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">Product #{order.product_id?.substring(0, 8)}</p>
                    <p className="text-xs text-gray-500">Premium Grade Produce</p>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">{order.quantity} {order.unit || 'kg'}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">₹{payment.product_price ? (payment.product_price / order.quantity).toFixed(2) : '-'}</td>
                  <td className="py-4 px-4 text-right font-black text-gray-900">₹{payment.product_price || totalAmount}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="bg-gray-50/50 p-6 border-t border-gray-200 flex flex-col items-end gap-2">
              {payment.delivery_charge > 0 && (
                <div className="flex justify-between w-full sm:w-64 text-sm font-medium text-gray-600">
                  <span>Delivery Charge</span>
                  <span>₹{payment.delivery_charge}</span>
                </div>
              )}
              {payment.platform_fee > 0 && (
                <div className="flex justify-between w-full sm:w-64 text-sm font-medium text-gray-600">
                  <span>Platform Fee</span>
                  <span>₹{payment.platform_fee}</span>
                </div>
              )}
              {payment.gst > 0 && (
                <div className="flex justify-between w-full sm:w-64 text-sm font-medium text-gray-600">
                  <span>GST/Taxes</span>
                  <span>₹{payment.gst}</span>
                </div>
              )}
              <div className="h-px bg-gray-200 w-full sm:w-64 my-2" />
              <div className="flex justify-between w-full sm:w-64 text-lg font-black text-gray-900">
                <span>Total Amount</span>
                <span className="text-emerald-600">₹{totalAmount}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Payment Method: {payment.payment_method || 'Wallet'}</p>
            </div>
          </div>

          {/* Blockchain Verification Section */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
            
            <div className="bg-white p-3 rounded-xl shrink-0 z-10">
              <QRCodeSVG value={explorerUrl} size={96} level="H" includeMargin={false} />
            </div>
            
            <div className="flex-1 z-10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">On-Chain Verified Bill</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                This invoice is backed by an immutable smart contract on the Arbitrum Sepolia network. Scan the QR code to verify the transaction hashes and escrow locks directly on the blockchain explorer.
              </p>
              
              <div className="grid grid-cols-1 gap-2 text-[10px] font-mono">
                {order.escrow_contract_address && (
                  <div className="flex justify-between bg-white/5 p-2 rounded">
                    <span className="text-gray-500">Escrow Contract:</span>
                    <span className="text-gray-300 break-all">{order.escrow_contract_address}</span>
                  </div>
                )}
                {order.blockchain_tx_hash && (
                  <div className="flex justify-between bg-white/5 p-2 rounded">
                    <span className="text-gray-500">Escrow Lock TX:</span>
                    <span className="text-gray-300 break-all">{order.blockchain_tx_hash}</span>
                  </div>
                )}
                {order.blockchain_release_tx_hash && (
                  <div className="flex justify-between bg-white/5 p-2 rounded">
                    <span className="text-emerald-500/70">Payment Release TX:</span>
                    <span className="text-emerald-400 break-all">{order.blockchain_release_tx_hash}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Generated securely via AgriChain decentralized marketplace.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
