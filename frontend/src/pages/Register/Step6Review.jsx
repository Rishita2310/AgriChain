import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRegisterStore } from '../../store/useRegisterStore';
import { User, ShieldCheck } from 'lucide-react';
import { useSignMessage } from 'wagmi';
import toast from 'react-hot-toast';
import axios from '@/services/api';

export default function Step6Review() {
  const { formData, setStep, nextStep, prevStep } = useRegisterStore();
  const { setAuth } = useAuthStore();
  const { signMessageAsync } = useSignMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Request nonce for registration verification
      const reqRes = await axios.post('/auth/login/request', {
        wallet_address: formData.wallet_address,
      });

      // 2. Prompt user to sign the message
      const signature = await signMessageAsync({ message: reqRes.data.message });

      // 3. Submit registration with signature
      const payload = {
        ...formData,
        signature,
      };

      const response = await axios.post('/auth/register', payload);
      const token = response.data.token;
      
      try {
        const profileRes = await axios.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAuth(token, profileRes.data);
      } catch (profileErr) {
        localStorage.setItem('agrichain_token', token);
      }

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