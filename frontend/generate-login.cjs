const fs = require('fs');
const path = require('path');

const files = {
    'src/store/useAuthStore.js': `
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  
  setAuth: (token, user) => {
    localStorage.setItem('agrichain_token', token);
    set({ isAuthenticated: true, user, token });
  },
  
  logout: () => {
    localStorage.removeItem('agrichain_token');
    set({ isAuthenticated: false, user: null, token: null });
  },

  initAuth: (token, user) => {
    set({ isAuthenticated: true, token, user });
  }
}));
`,
    'src/pages/Login/index.jsx': `
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Wallet, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, connecting, verifying, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const connectAndLogin = async () => {
    setErrorMsg('');
    setStatus('connecting');
    
    if (!window.ethereum) {
      setStatus('error');
      setErrorMsg('MetaMask is not installed. Please install it to continue.');
      return;
    }

    try {
      // 1. Connect Wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setWalletAddress(address);
      
      setStatus('verifying');

      // 2. Request Nonce
      const reqRes = await axios.post('http://localhost:3000/api/auth/login/request', { wallet_address: address });
      const { message, nonce } = reqRes.data;

      // 3. Sign Message
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // 4. Verify Signature & Login
      const verifyRes = await axios.post('http://localhost:3000/api/auth/login/verify', {
        wallet_address: address,
        signature
      });

      // 5. Success
      setAuth(verifyRes.data.token, { role: verifyRes.data.role, wallet_address: address });
      setStatus('success');
      toast.success('Login Successful!');
      
      setTimeout(() => {
        if (verifyRes.data.role === 'Farmer') navigate('/farmer/dashboard');
        else if (verifyRes.data.role === 'Buyer') navigate('/buyer/dashboard');
        else navigate('/');
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatus('error');
      
      if (err.code === 4001) {
        setErrorMsg('Signature request was rejected.');
      } else if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg('Authentication failed. Please try again.');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | AgriChain</title>
      </Helmet>
      
      <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
          
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h2>
            <p className="text-gray-500">Connect your wallet to securely log in to your dashboard.</p>
          </div>

          <div className="flex flex-col items-center justify-center mb-10 relative z-10">
            <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-8 relative">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-20 h-20" />
              {status === 'success' && (
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                </div>
              )}
            </div>

            {status === 'error' && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center mb-6 text-sm w-full border border-red-100">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {status === 'success' ? (
              <div className="text-center w-full">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-green-800 font-bold mb-1">Login Successful!</p>
                  <p className="text-gray-900 font-mono text-xs break-all">
                    {walletAddress.substring(0, 8)}...{walletAddress.substring(34)}
                  </p>
                </div>
                <p className="text-sm text-gray-500 animate-pulse">Redirecting to dashboard...</p>
              </div>
            ) : (
              <button 
                onClick={connectAndLogin}
                disabled={status === 'connecting' || status === 'verifying'}
                className="bg-[#F6851B] hover:bg-[#E2761B] disabled:bg-gray-300 disabled:shadow-none text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 text-lg w-full"
              >
                {status === 'idle' || status === 'error' ? (
                  <>
                    <Wallet className="w-6 h-6" />
                    Connect Wallet
                  </>
                ) : (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {status === 'connecting' ? 'Connecting...' : 'Verifying...'}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="text-center border-t border-gray-100 pt-6 relative z-10">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create one now
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim());
}
console.log("Login module frontend files created.");
