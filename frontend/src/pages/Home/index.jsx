import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import Testimonials from '../../components/landing/Testimonials';
import FAQ from '../../components/landing/FAQ';
import CallToAction from '../../components/landing/CallToAction';
import MetaMaskGuide from '../../components/landing/MetaMaskGuide';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>AgriChain | Blockchain Agricultural Marketplace</title>
        <meta name="description" content="Connect directly with trusted buyers, eliminate unnecessary middlemen, receive transparent payments, and trade securely using blockchain technology." />
        <meta property="og:title" content="AgriChain | Blockchain Agricultural Marketplace" />
        <meta property="og:description" content="Global agricultural trading platform powered by blockchain." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://agrichain.com" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Hero />
        <Features />
        <MetaMaskGuide />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </div>
    </>
  );
}