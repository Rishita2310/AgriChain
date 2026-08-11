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