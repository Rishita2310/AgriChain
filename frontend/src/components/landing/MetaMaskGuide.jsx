import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wallet, Download, CheckCircle, ArrowRight } from 'lucide-react';

export default function MetaMaskGuide() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: <Download className="w-6 h-6 text-emerald-600" />,
      title: t('metamask.step1_title'),
      desc: t('metamask.step1_desc'),
      link: 'https://metamask.io/download/'
    },
    {
      icon: <Wallet className="w-6 h-6 text-emerald-600" />,
      title: t('metamask.step2_title'),
      desc: t('metamask.step2_desc')
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      title: t('metamask.step3_title'),
      desc: t('metamask.step3_desc')
    }
  ];

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            {t('metamask.headline')}
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            {t('metamask.subheadline')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative p-6 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{step.desc}</p>
              
              {step.link && (
                <a 
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                >
                  {t('metamask.download_btn')} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
