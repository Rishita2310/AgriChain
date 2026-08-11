import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserDashboardPath } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function SuccessScreen() {
  const { formData } = useRegisterStore();
  const { user } = useAuthStore();
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
        onClick={() => {
          const targetUser = user || { role: formData.role, farmer_details: formData.farmer_details };
          navigate(getUserDashboardPath(targetUser), { replace: true });
        }}
        className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
      >
        Go to Dashboard <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}