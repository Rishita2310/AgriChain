import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wallet, Lock, Info, CheckCircle2, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { getProductImageUrl } from '@/services/product.service';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, parseGwei } from 'viem';
import toast from 'react-hot-toast';
import EscrowABI from '@/contracts/EscrowABI.json';

const ARBITRUM_ESCROW_CONTRACT = "0x2C4A7e3D94bC4c10D204A81E99525Db724a73752".toLowerCase();

export default function EscrowPaymentView({ 
  product, 
  quantity, 
  address, 
  coupon, 
  orderId,
  onPaymentSuccess, 
  onCancel 
}) {
  const { address: userWallet, isConnected, chain } = useAccount();
  const { data: balanceData, isLoading: balanceLoading } = useBalance({ 
    address: userWallet,
    query: { enabled: !!userWallet }
  });

  const { writeContractAsync, isPending: isTxSending } = useWriteContract();
  const [txHash, setTxHash] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ethRate, setEthRate] = useState(1 / 0.00000555); // Fixed rate: 1 INR = 0.00000555 ETH
  const [fetchingRate, setFetchingRate] = useState(false);

  useEffect(() => {
    // Live rate fetching removed, using fixed conversion
  }, []);

  const { isLoading: isWaitingReceipt, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash }
  });

  // Financial calculations
  const subtotal = product ? parseFloat(product.price || 0) * parseFloat(quantity || 0) : 0;
  const total = subtotal;

  // Convert INR amount to exact ETH based on fixed rate
  const ethEquivalent = (total * 0.00000555).toFixed(8);

  const handlePayClick = async () => {
    if (!isConnected || !userWallet) {
      toast.error('Please connect your MetaMask wallet first');
      return;
    }
    if (!orderId) {
      toast.error('Order ID is missing, please go back and try again.');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Please confirm transaction in MetaMask...', { id: 'tx-toast' });

      // Trigger real transaction on Arbitrum Sepolia
      const hash = await writeContractAsync({
        address: ARBITRUM_ESCROW_CONTRACT,
        abi: EscrowABI,
        functionName: 'deposit',
        args: [orderId, (product.wallet_address || product.farmerWallet).toLowerCase()],
        value: parseEther(ethEquivalent.toString()),
        maxFeePerGas: parseGwei('2'),
        maxPriorityFeePerGas: parseGwei('2'),
      });

      setTxHash(hash);
      toast.success('Transaction submitted to Arbitrum Sepolia!', { id: 'tx-toast' });

      // Wait a little before calling backend to ensure transaction is picked up by RPC
      setTimeout(() => {
        onPaymentSuccess(hash, ethEquivalent, ethRate);
      }, 5000);

    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.shortMessage || err.message || 'MetaMask transaction rejected', { id: 'tx-toast' });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full animate-in fade-in zoom-in duration-500">
      
      {/* LEFT SIDE: Order Details */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
             <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100 font-mono">
               Order: {orderId}
             </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg"><Lock className="w-5 h-5 text-green-700" /></div>
            <div>
              <p className="font-bold text-gray-900">{address?.full_name}</p>
              <p className="text-gray-500 text-sm mt-1">{address?.address_line1}, {address?.city}, {address?.state} - {address?.pin_code}</p>
              <p className="text-gray-500 text-sm mt-1">📞 {address?.phone_number}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="flex gap-4 items-center">
            <img 
              src={product?.images?.[0] ? getProductImageUrl(product.images[0]) : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=200'} 
              alt={product?.product_name} 
              className="w-20 h-20 rounded-xl object-cover" 
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=200'; }} 
            />
            <div>
              <h3 className="font-bold text-gray-900">{product?.product_name}</h3>
              <p className="text-sm text-gray-500">{product?.category} • Farmer: {product?.wallet_address ? `${product.wallet_address.slice(0, 6)}...${product.wallet_address.slice(-4)}` : 'Farmer'}</p>
              <p className="font-medium text-gray-900 mt-1">₹{product?.price} / {product?.unit} × {quantity} {product?.unit}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Breakdown</h2>
           <div className="space-y-3 text-sm text-gray-600 mb-4">
              <div className="flex justify-between"><span>Product Price</span><span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span></div>
           </div>
           <hr className="border-gray-100 my-4" />
           <div className="flex justify-between items-center text-xl">
             <div>
               <span className="font-bold text-gray-900 block">Total Amount</span>
               <span className="text-xs text-gray-400 font-normal">
                 {fetchingRate ? 'Fetching live rate...' : `≈ ${ethEquivalent} ETH on Arbitrum Sepolia (@ ₹${ethRate.toLocaleString()}/ETH)`}
               </span>
             </div>
             <span className="font-extrabold text-green-700">₹{total.toFixed(2)}</span>
           </div>
        </div>
      </div>

      {/* RIGHT SIDE: Real Escrow & Wallet Details */}
      <div className="w-full lg:w-[450px] space-y-6">
        
        {/* Real Live Connected Wallet Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" /> Connected Wallet
            </h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
              isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
               <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span> 
               {isConnected ? 'MetaMask Ready' : 'Disconnected'}
            </span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Address</span>
              <span className="font-mono text-gray-900 text-xs font-bold truncate max-w-[180px]">
                {userWallet ? `${userWallet.slice(0, 8)}...${userWallet.slice(-6)}` : 'Not Connected'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Live Balance</span>
              <span className="font-medium text-gray-900">
                {balanceLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : balanceData ? (
                  `${parseFloat(formatEther(balanceData.value)).toFixed(4)} ${balanceData.symbol}`
                ) : (
                  '0.0000 ETH'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Network</span>
              <span className="font-medium text-blue-600 flex items-center gap-1">
                {chain?.name || 'Arbitrum Sepolia'}
              </span>
            </div>
          </div>
        </div>

        {/* Blockchain Escrow Information */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Arbitrum Stylus Escrow</h3>
              <p className="text-xs text-indigo-300">Smart Contract Guaranteed Payment</p>
            </div>
          </div>
          
          <div className="space-y-2.5 text-sm text-indigo-100 mb-6 bg-black/30 p-4 rounded-xl border border-white/10 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400 font-sans">Contract:</span>
              <span className="text-emerald-400">{ARBITRUM_ESCROW_CONTRACT.slice(0, 10)}...{ARBITRUM_ESCROW_CONTRACT.slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-sans">Deposit Value:</span>
              <span className="font-bold text-white font-mono">{ethEquivalent} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-sans">Protection:</span>
              <span className="text-amber-300 font-sans font-bold">Locked until delivery</span>
            </div>
          </div>
          
          <div className="flex items-start gap-3 text-xs text-indigo-200 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
            <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            <p>Your funds are held securely inside the Arbitrum Sepolia smart contract. Once you receive your agricultural produce and confirm delivery, the funds are automatically released to the farmer.</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-rose-800">No Cancellation Possible</p>
            <p className="text-rose-700 mt-0.5 leading-relaxed">
              Once you lock the payment in the smart contract, the order is confirmed and <strong>cannot be cancelled</strong> from your side. The funds will only be released after successful delivery or refunded if the farmer rejects the order.
            </p>
          </div>
        </div>

        {/* Payment Trigger Buttons */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          {txHash ? (
             <div className="py-4 space-y-3">
               <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
               <h3 className="text-xl font-bold text-gray-900">Escrow Locked on Blockchain!</h3>
               <p className="text-xs font-mono text-gray-500 truncate max-w-xs mx-auto">
                 Tx: {txHash}
               </p>
               <a 
                 href={`https://sepolia.arbiscan.io/tx/${txHash}`} 
                 target="_blank" 
                 rel="noreferrer"
                 className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mt-2"
               >
                 View on Arbiscan Sepolia <ExternalLink className="w-3.5 h-3.5" />
               </a>
             </div>
          ) : (
            <>
              <button 
                onClick={handlePayClick}
                disabled={isProcessing || isTxSending || !isConnected || fetchingRate}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-lg shadow-emerald-600/25 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing || isTxSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Waiting for MetaMask Approval...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" /> Pay & Lock {ethEquivalent} ETH in Escrow
                  </>
                )}
              </button>
              <button 
                onClick={onCancel} 
                disabled={isProcessing || isTxSending}
                className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Cancel & Return
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
