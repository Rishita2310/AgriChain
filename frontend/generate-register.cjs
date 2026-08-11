const fs = require('fs');
const path = require('path');

const files = {
    'src/store/useRegisterStore.js': `
import { create } from 'zustand';

export const useRegisterStore = create((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 6) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  
  formData: {
    role: '',
    wallet_address: '',
    full_name: '',
    email: '',
    phone_number: '',
    country: '',
    state: '',
    city: '',
    preferred_language: 'en',
    profile_photo: null,
    farmer_details: {
      farm_name: '',
      farm_address: '',
      farm_size: 0,
      experience: 'Less than 1 year',
      organic_farming: false,
      primary_crops: [],
      notes: ''
    },
    buyer_details: {
      business_name: '',
      business_type: 'Retailer',
      delivery_address: '',
      gst_number: '',
      registration_number: '',
      website: ''
    }
  },
  
  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  updateFarmerDetails: (data) => set((state) => ({
    formData: { 
      ...state.formData, 
      farmer_details: { ...state.formData.farmer_details, ...data } 
    }
  })),
  
  updateBuyerDetails: (data) => set((state) => ({
    formData: { 
      ...state.formData, 
      buyer_details: { ...state.formData.buyer_details, ...data } 
    }
  })),
}));
`,
    'src/components/common/ProgressBar.jsx': `
import React from 'react';

export default function ProgressBar({ currentStep, totalSteps }) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm font-bold text-primary">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: \`\${percentage}%\` }}
        ></div>
      </div>
    </div>
  );
}
`,
    'src/pages/Register/index.jsx': `
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { useRegisterStore } from '../../store/useRegisterStore';
import ProgressBar from '../../components/common/ProgressBar';

import Step1Role from './Step1Role';
import Step2Wallet from './Step2Wallet';
import Step3BasicInfo from './Step3BasicInfo';
import Step4RoleInfo from './Step4RoleInfo';
import Step5ProfilePhoto from './Step5ProfilePhoto';
import Step6Review from './Step6Review';
import SuccessScreen from './SuccessScreen';

export default function Register() {
  const { step } = useRegisterStore();

  const renderStep = () => {
    switch(step) {
      case 1: return <Step1Role />;
      case 2: return <Step2Wallet />;
      case 3: return <Step3BasicInfo />;
      case 4: return <Step4RoleInfo />;
      case 5: return <Step5ProfilePhoto />;
      case 6: return <Step6Review />;
      case 7: return <SuccessScreen />;
      default: return <Step1Role />;
    }
  };

  if (step === 7) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <SuccessScreen />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Account | AgriChain</title>
      </Helmet>
      
      <div className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ProgressBar currentStep={step} totalSteps={6} />
          
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 md:p-12 h-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
`,
    'src/pages/Register/Step1Role.jsx': `
import React from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { Sprout, ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function Step1Role() {
  const { formData, updateFormData, nextStep } = useRegisterStore();

  const handleSelect = (role) => {
    updateFormData({ role });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Your AgriChain Account</h2>
        <p className="text-gray-500">Select how you want to use AgriChain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Farmer Card */}
        <div 
          onClick={() => handleSelect('Farmer')}
          className={\`relative cursor-pointer rounded-2xl p-6 border-2 transition-all \${formData.role === 'Farmer' ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'}\`}
        >
          {formData.role === 'Farmer' && <CheckCircle2 className="absolute top-4 right-4 text-primary w-6 h-6" />}
          <div className={\`w-14 h-14 rounded-full flex items-center justify-center mb-6 \${formData.role === 'Farmer' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}\`}>
            <Sprout className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Farmer</h3>
          <ul className="text-sm text-gray-500 space-y-2 mb-6">
            <li>• Sell crops directly to buyers</li>
            <li>• Manage harvests</li>
            <li>• Receive secure payments</li>
            <li>• Track blockchain transactions</li>
          </ul>
        </div>

        {/* Buyer Card */}
        <div 
          onClick={() => handleSelect('Buyer')}
          className={\`relative cursor-pointer rounded-2xl p-6 border-2 transition-all \${formData.role === 'Buyer' ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'}\`}
        >
          {formData.role === 'Buyer' && <CheckCircle2 className="absolute top-4 right-4 text-primary w-6 h-6" />}
          <div className={\`w-14 h-14 rounded-full flex items-center justify-center mb-6 \${formData.role === 'Buyer' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}\`}>
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Buyer</h3>
          <ul className="text-sm text-gray-500 space-y-2 mb-6">
            <li>• Purchase directly from farmers</li>
            <li>• Browse marketplace</li>
            <li>• Place secure orders</li>
            <li>• Transparent pricing</li>
          </ul>
        </div>
      </div>

      <div className="mt-auto flex justify-end">
        <button 
          onClick={nextStep}
          disabled={!formData.role}
          className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
`,
    'src/pages/Register/Step2Wallet.jsx': `
import React, { useState } from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

export default function Step2Wallet() {
  const { formData, updateFormData, nextStep, prevStep } = useRegisterStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setError('');
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to continue.');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        updateFormData({ wallet_address: accounts[0] });
        toast.success('Wallet connected successfully!');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    updateFormData({ wallet_address: '' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Connect Your Wallet</h2>
        <p className="text-gray-500">Connect your MetaMask wallet to continue.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-8 relative">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-20 h-20" />
          {formData.wallet_address && (
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center mb-6 text-sm max-w-md w-full">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {formData.wallet_address ? (
          <div className="text-center w-full max-w-md">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800 font-medium mb-1">Wallet Connected</p>
              <p className="text-gray-900 font-mono text-sm break-all">
                {formData.wallet_address.substring(0, 6)}...{formData.wallet_address.substring(38)}
              </p>
            </div>
            <button 
              onClick={disconnectWallet}
              className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-[#F6851B] hover:bg-[#E2761B] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-3 text-lg w-full max-w-xs justify-center"
          >
            <Wallet className="w-6 h-6" />
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        )}
      </div>

      <div className="mt-auto flex justify-between pt-8 border-t border-gray-100">
        <button 
          onClick={prevStep}
          className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors"
        >
          Back
        </button>
        <button 
          onClick={nextStep}
          disabled={!formData.wallet_address}
          className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
`,
    'src/pages/Register/Step3BasicInfo.jsx': `
import React from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  full_name: z.string().min(3, "Name must be at least 3 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Invalid phone number"),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().optional(),
  preferred_language: z.string().min(1, "Language is required"),
});

export default function Step3BasicInfo() {
  const { formData, updateFormData, nextStep, prevStep } = useRegisterStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      preferred_language: formData.preferred_language,
    }
  });

  const onSubmit = (data) => {
    updateFormData(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-500">Please provide your contact details.</p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2 pb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input 
            {...register("full_name")}
            type="text" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="John Doe"
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input 
              {...register("email")}
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input 
              {...register("phone_number")}
              type="tel" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="+1 234 567 8900"
            />
            {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input 
              {...register("country")}
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. India"
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
            <input 
              {...register("state")}
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Gujarat"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input 
              {...register("city")}
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Ahmedabad"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language *</label>
          <select 
            {...register("preferred_language")}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
          {errors.preferred_language && <p className="text-red-500 text-xs mt-1">{errors.preferred_language.message}</p>}
        </div>
      </div>

      <div className="mt-6 flex justify-between pt-6 border-t border-gray-100 bg-white relative z-10">
        <button 
          type="button"
          onClick={prevStep}
          className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors"
        >
          Back
        </button>
        <button 
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
`,
    'src/pages/Register/Step4RoleInfo.jsx': `
import React from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { useForm } from 'react-hook-form';

export default function Step4RoleInfo() {
  const { formData, updateFarmerDetails, updateBuyerDetails, nextStep, prevStep } = useRegisterStore();
  const isFarmer = formData.role === 'Farmer';

  const { register, handleSubmit } = useForm({
    defaultValues: isFarmer ? formData.farmer_details : formData.buyer_details
  });

  const onSubmit = (data) => {
    if (isFarmer) {
      // Clean up multiple selects if needed
      updateFarmerDetails(data);
    } else {
      updateBuyerDetails(data);
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{isFarmer ? 'Farm Details' : 'Business Details'}</h2>
        <p className="text-gray-500">Provide specific information for your {isFarmer ? 'farm' : 'business'}.</p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2 pb-4">
        {isFarmer ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
              <input {...register("farm_name", { required: true })} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address *</label>
              <textarea {...register("farm_address", { required: true })} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary" required></textarea>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (Acres)</label>
                <input {...register("farm_size", { valueAsNumber: true })} type="number" min="0" step="0.1" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select {...register("experience")} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary bg-white">
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5-10 Years">5-10 Years</option>
                  <option value="10+ Years">10+ Years</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input {...register("business_name", { required: true })} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <select {...register("business_type")} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary bg-white">
                <option value="Retailer">Retailer</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Distributor">Distributor</option>
                <option value="Exporter">Exporter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
              <textarea {...register("delivery_address", { required: true })} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary" required></textarea>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                <input {...register("gst_number")} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
                <input {...register("website")} type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-between pt-6 border-t border-gray-100 bg-white">
        <button type="button" onClick={prevStep} className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors">Back</button>
        <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all">Continue</button>
      </div>
    </form>
  );
}
`,
    'src/pages/Register/Step5ProfilePhoto.jsx': `
import React, { useState } from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { UploadCloud, X, User } from 'lucide-react';

export default function Step5ProfilePhoto() {
  const { formData, updateFormData, nextStep, prevStep } = useRegisterStore();
  const [preview, setPreview] = useState(formData.profile_photo || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        updateFormData({ profile_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    updateFormData({ profile_photo: null });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Profile Photo</h2>
        <p className="text-gray-500">Add a photo to help others recognize you (Optional).</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="relative w-40 h-40 mb-8">
          {preview ? (
            <>
              <img src={preview} alt="Profile preview" className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg" />
              <button 
                onClick={handleRemove}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="w-full h-full rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center text-gray-400">
              <User className="w-16 h-16" />
            </div>
          )}
        </div>

        <label className="bg-white border border-gray-200 hover:border-primary text-gray-700 hover:text-primary px-6 py-3 rounded-full font-medium transition-all cursor-pointer flex items-center gap-2 shadow-sm">
          <UploadCloud className="w-5 h-5" />
          {preview ? 'Replace Photo' : 'Upload Photo'}
          <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileChange} />
        </label>
        <p className="text-xs text-gray-400 mt-4">Supported formats: PNG, JPG, WEBP. Max size: 5MB.</p>
      </div>

      <div className="mt-auto flex justify-between pt-8 border-t border-gray-100">
        <button onClick={prevStep} className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors">Back</button>
        <button onClick={nextStep} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all">
          {preview ? 'Continue' : 'Skip & Continue'}
        </button>
      </div>
    </div>
  );
}
`,
    'src/pages/Register/Step6Review.jsx': `
import React, { useState } from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Step6Review() {
  const { formData, setStep, nextStep, prevStep } = useRegisterStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      // Store JWT (in real app, use secure storage)
      localStorage.setItem('agrichain_token', response.data.token);
      toast.success(response.data.message || 'Registration successful!');
      nextStep(); // Go to success screen
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Information</h2>
        <p className="text-gray-500">Please verify your details before submitting.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6">
        
        {/* Basic Info Section */}
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
            <h3 className="font-bold text-gray-900">Basic Information</h3>
            <button onClick={() => setStep(3)} className="text-sm text-primary font-medium hover:underline">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 block mb-1">Full Name</span><span className="font-medium">{formData.full_name}</span></div>
            <div><span className="text-gray-500 block mb-1">Email</span><span className="font-medium">{formData.email}</span></div>
            <div><span className="text-gray-500 block mb-1">Phone</span><span className="font-medium">{formData.phone_number}</span></div>
            <div><span className="text-gray-500 block mb-1">Country</span><span className="font-medium">{formData.country}</span></div>
          </div>
        </div>

        {/* Role Section */}
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
            <h3 className="font-bold text-gray-900">Account Type</h3>
            <button onClick={() => setStep(1)} className="text-sm text-primary font-medium hover:underline">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 block mb-1">Role</span><span className="font-medium inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary">{formData.role}</span></div>
            <div>
              <span className="text-gray-500 block mb-1">Wallet Address</span>
              <span className="font-medium font-mono text-xs break-all bg-white px-2 py-1 rounded border border-gray-200 block">
                {formData.wallet_address || 'Not connected'}
              </span>
            </div>
          </div>
        </div>

        {/* Specific Info Section */}
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
            <h3 className="font-bold text-gray-900">{formData.role === 'Farmer' ? 'Farm Details' : 'Business Details'}</h3>
            <button onClick={() => setStep(4)} className="text-sm text-primary font-medium hover:underline">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {formData.role === 'Farmer' ? (
              <>
                <div><span className="text-gray-500 block mb-1">Farm Name</span><span className="font-medium">{formData.farmer_details.farm_name}</span></div>
                <div><span className="text-gray-500 block mb-1">Experience</span><span className="font-medium">{formData.farmer_details.experience}</span></div>
              </>
            ) : (
              <>
                <div><span className="text-gray-500 block mb-1">Business Name</span><span className="font-medium">{formData.buyer_details.business_name}</span></div>
                <div><span className="text-gray-500 block mb-1">Type</span><span className="font-medium">{formData.buyer_details.business_type}</span></div>
              </>
            )}
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer p-4 bg-primary/5 rounded-xl border border-primary/20">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
          <span className="text-sm text-gray-700 leading-snug">
            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. I understand that blockchain transactions are immutable.
          </span>
        </label>
      </div>

      <div className="mt-6 flex justify-between pt-6 border-t border-gray-100 bg-white">
        <button type="button" onClick={prevStep} disabled={isSubmitting} className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors">Back</button>
        <button 
          onClick={handleSubmit} 
          disabled={!agreed || isSubmitting}
          className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </div>
    </div>
  );
}
`,
    'src/pages/Register/SuccessScreen.jsx': `
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { useNavigate } from 'react-router-dom';

export default function SuccessScreen() {
  const { formData } = useRegisterStore();
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-lg w-full text-center"
    >
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to AgriChain!</h2>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Your account has been successfully created. You can now access your personalized {formData.role.toLowerCase()} dashboard.
      </p>

      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left mb-8">
        <h4 className="font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider">Profile Summary</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{formData.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{formData.role}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Wallet</span>
            <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 border border-gray-200 rounded">
              {formData.wallet_address.substring(0, 6)}...{formData.wallet_address.substring(38)}
            </span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
      >
        Go to Dashboard <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim());
}
console.log("Registration module frontend files created.");
