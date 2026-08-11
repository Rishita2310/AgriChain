import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useConnect, useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useNavigate, Link } from 'react-router-dom';
import axios from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserDashboardPath } from '../../utils/auth';
import { Helmet } from 'react-helmet-async';
import { 
  Wallet, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  LogOut,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { connectAsync, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth } = useAuthStore();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false);

  // If already authenticated, redirect to role dashboard immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getUserDashboardPath(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Check if MetaMask or Injected provider is available
  const hasInjectedProvider = typeof window !== 'undefined' && Boolean(window.ethereum);

  // Filter and deduplicate connectors to prevent duplicate buttons
  const uniqueConnectors = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const connector of connectors) {
      const normalizedName = connector.name.toLowerCase();
      // Normalize MetaMask / Injected duplicates
      const key = normalizedName.includes('metamask') ? 'metamask' : connector.id || connector.name;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(connector);
      }
    }
    return result;
  }, [connectors]);

  // Authenticate user via nonce request and personal_sign
  const performAuthentication = useCallback(async (walletAddress) => {
    const targetAddress = walletAddress || address;
    if (!targetAddress) return;

    setIsAuthenticating(true);
    setAuthError(null);
    setIsNotRegistered(false);

    try {
      // 1. Request nonce for login
      const reqRes = await axios.post('/auth/login/request', {
        wallet_address: targetAddress,
      });

      const messageToSign = reqRes.data.message;

      // 2. Request user to sign message via wallet
      const signature = await signMessageAsync({ message: messageToSign });

      // 3. Verify signature on backend
      const verifyRes = await axios.post('/auth/login/verify', {
        wallet_address: targetAddress,
        signature,
      });

      const token = verifyRes.data.token;

      // 4. Fetch full user profile
      const profileRes = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Welcome back, ${profileRes.data.full_name || 'User'}!`);
      setAuth(token, profileRes.data);

      // 5. Navigate to role dashboard
      navigate(getUserDashboardPath(profileRes.data), { replace: true });
    } catch (error) {
      console.error("Login verification failed:", error);
      
      const serverMsg = error.response?.data?.error;
      const is404 = error.response?.status === 404;
      const isUserRejected = error.code === 4001 || 
                             error.message?.toLowerCase().includes('user rejected') ||
                             error.message?.toLowerCase().includes('user denied');

      if (is404 || (serverMsg && serverMsg.toLowerCase().includes('not registered'))) {
        setIsNotRegistered(true);
        setAuthError("This wallet is not registered yet. Please create an account to continue.");
        toast.error("Wallet not registered. Please register first.");
      } else if (isUserRejected) {
        setAuthError("Signature request was cancelled in your wallet.");
        toast.error("Signature cancelled. Click 'Sign In' to retry.");
      } else {
        const errorMsg = serverMsg || error.message || "Authentication failed. Please try again.";
        setAuthError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, setAuth, navigate]);

  // Handle wallet connection + automatic sign flow initiation
  const handleConnectAndLogin = async (connector) => {
    setAuthError(null);
    setIsNotRegistered(false);

    try {
      const connectResult = await connectAsync({ connector });
      const connectedAddr = connectResult.accounts?.[0] || connectResult.account;
      if (connectedAddr) {
        await performAuthentication(connectedAddr);
      }
    } catch (err) {
      console.error("Connection failed:", err);
      const isUserRejected = err.code === 4001 || 
                             err.message?.toLowerCase().includes('user rejected') || 
                             err.message?.toLowerCase().includes('user denied');
      if (isUserRejected) {
        setAuthError("Wallet connection request was rejected.");
      } else {
        setAuthError(err.message || "Failed to connect wallet.");
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setAuthError(null);
    setIsNotRegistered(false);
    toast.success("Wallet disconnected");
  };

  const formattedAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` 
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-gray-50 to-green-100/40 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <Helmet>
        <title>Login | AgriChain</title>
      </Helmet>

      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden relative z-10"
      >
        {/* Top brand header bar */}
        <div className="bg-gradient-to-r from-primary to-emerald-600 h-2 w-full" />

        <div className="p-8 sm:p-10 text-center">
          {/* Brand Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="absolute -top-1 -right-1 bg-primary text-white p-1 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8">
            Access your secure AgriChain decentralized dashboard.
          </p>

          {/* Connected Wallet State */}
          {isConnected && address ? (
            <div className="space-y-5">
              {/* Connected Address Card */}
              <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-4 text-left shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      Wallet Connected
                    </span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    disabled={isAuthenticating}
                    className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors disabled:opacity-50"
                    title="Disconnect wallet"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-100">
                  <span className="font-mono text-sm font-semibold text-gray-800">
                    {formattedAddress}
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    Arbitrum
                  </span>
                </div>
              </div>

              {/* Primary Action Button: Sign In */}
              <button
                onClick={() => performAuthentication(address)}
                disabled={isAuthenticating}
                className="w-full relative flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark active:scale-[0.99] text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-75 disabled:cursor-not-allowed text-base"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming in Wallet...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In with Wallet</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Disconnected Wallet State: Single Clean Connect Button */
            <div className="space-y-4">
              {hasInjectedProvider || uniqueConnectors.length > 0 ? (
                <>
                  {/* Primary MetaMask / Injected Connect Button */}
                  <button
                    onClick={() => handleConnectAndLogin(uniqueConnectors[0])}
                    disabled={isConnecting || isAuthenticating}
                    className="w-full relative flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white p-4 rounded-2xl font-semibold transition-all shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 disabled:opacity-70 disabled:cursor-not-allowed group text-base"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                        alt="MetaMask" 
                        className="w-6 h-6 transition-transform group-hover:scale-110" 
                      />
                    )}
                    <span>
                      {isConnecting ? 'Connecting Wallet...' : 'Connect with MetaMask'}
                    </span>
                  </button>

                  {/* Secondary Unique Connectors if any */}
                  {uniqueConnectors.slice(1).map((connector) => (
                    <button
                      key={connector.uid || connector.id}
                      onClick={() => handleConnectAndLogin(connector)}
                      disabled={isConnecting || isAuthenticating}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 p-3.5 rounded-2xl font-medium transition-all text-sm disabled:opacity-60"
                    >
                      <Wallet className="w-4 h-4 text-gray-600" />
                      <span>Connect with {connector.name}</span>
                    </button>
                  ))}
                </>
              ) : (
                /* MetaMask not installed fallback */
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#F6851B] hover:bg-[#E2761B] text-white p-4 rounded-2xl font-semibold transition-all shadow-lg shadow-orange-500/20"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                    alt="MetaMask" 
                    className="w-6 h-6" 
                  />
                  <span>Install MetaMask to Login</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          )}

          {/* Authentication Loading State Note */}
          <AnimatePresence>
            {isAuthenticating && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center gap-3 text-primary text-sm font-medium"
              >
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                <span>Please sign the message in your MetaMask popup...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unregistered Wallet Notice */}
          <AnimatePresence>
            {isNotRegistered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Account Not Found</h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      This wallet is not yet registered on AgriChain. Create your profile to start trading.
                    </p>
                    <Link
                      to="/register"
                      className="mt-3 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register Now</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* General Error Alert */}
          <AnimatePresence>
            {authError && !isNotRegistered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-5 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-start gap-3 text-sm text-left"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-medium block text-red-900">{authError}</span>
                  {isConnected && (
                    <button
                      onClick={() => performAuthentication(address)}
                      className="mt-2 text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Try signing again</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connect Error Alert */}
          {connectError && (
            <div className="mt-5 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 text-sm text-left">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{connectError.message}</span>
            </div>
          )}

          {/* Security & Verification Assurance */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cryptographically secured by Ethereum signatures</span>
          </div>

          {/* Register Link */}
          <div className="mt-4 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-primary-dark hover:underline transition-colors">
              Register here
            </Link>
          </div>

          {/* Back to Home Link */}
          <div className="mt-3">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Return to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}