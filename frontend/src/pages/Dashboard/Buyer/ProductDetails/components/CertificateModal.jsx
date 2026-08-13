import React from 'react';
import { X, Award, ShieldCheck, CheckCircle, Leaf } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function CertificateModal({ isOpen, onClose, product, farmer, qrData, blockchainData }) {
  if (!isOpen) return null;

  const qrString = qrData ? JSON.stringify(qrData) : "";
  const isVerified = blockchainData?.status === 'Verified';

  // Format dates
  const harvestDate = product?.quality?.harvest_date
    ? new Date(product.quality.harvest_date).toLocaleDateString()
    : 'N/A';

  const handleDownload = () => {
    const certElement = document.getElementById("certificate-content");
    // Ideally we would use html2canvas here, but for simplicity we'll just print it.
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] sm:max-h-[95vh] flex flex-col bg-gray-50 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header / Controls */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100 print:hidden z-10">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Digital Certificate</h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleDownload}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white transition-colors bg-emerald-600 rounded-lg sm:rounded-xl hover:bg-emerald-700 shadow-sm"
            >
              Print / Save
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-600 transition-colors bg-gray-100 border border-gray-200 rounded-lg sm:rounded-xl hover:text-gray-900 hover:bg-gray-200 shadow-sm"
            >
              Close <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Content - Scrolls independently */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 flex justify-center items-start sm:items-center hide-scrollbar">

          <div id="certificate-content"
            className="relative w-full max-w-[800px] bg-[#fcfbf9] text-gray-900 shadow-lg print:shadow-none overflow-hidden flex flex-col mx-auto"
            style={{ border: '1px solid #e5e7eb' }}>

            {/* Ornate Border Layers */}
            <div className="absolute inset-2 sm:inset-3 border-[1px] border-[#c0a062]"></div>
            <div className="absolute inset-3 sm:inset-4 border-[2px] sm:border-[3px] border-[#c0a062]"></div>

            {/* Subtle Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <Award className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] text-gray-900" />
            </div>

            {/* Inner Content */}
            <div className="relative z-10 flex flex-col flex-grow p-8 sm:p-14 mt-2 sm:mt-0">

              {/* Top Section */}
              <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 text-[#064e3b]">
                  <Leaf className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-lg sm:text-xl font-bold tracking-widest uppercase">AgriChain</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-bold text-[#111827] uppercase tracking-wider mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Certificate of Authenticity
                </h1>
                <div className="w-24 sm:w-32 h-[2px] bg-[#c0a062] my-3 sm:my-4"></div>
                <p className="text-xs sm:text-sm font-semibold tracking-[0.1em] sm:tracking-[0.2em] text-gray-500 uppercase text-center">
                  Official Blockchain Traceability Record
                </p>
              </div>

              {/* Middle Section - The Certification */}
              <div className="flex flex-col items-center flex-grow text-center">
                <p className="text-base sm:text-lg italic text-gray-600 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  This document certifies the origin and authenticity of
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#c0a062] capitalize mb-4 sm:mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  {product?.product_name}
                </h2>

                <p className="max-w-xl text-sm sm:text-base leading-relaxed text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                  Produced and harvested by <strong className="font-semibold text-gray-900">{farmer?.full_name || 'AgriChain Farmer'}</strong> in the region of <strong className="font-semibold text-gray-900">{product?.location?.city ? `${product.location.city}, ${product.location.state}` : (product?.location?.village || 'Verified Farm')}</strong>.
                  This product has been securely recorded on the platform, ensuring transparency, quality, and fair trade.
                </p>
              </div>

              {/* Bottom Section - Details & Seals */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between w-full gap-6 sm:gap-0 mt-8 pt-6 border-t border-[#c0a062]/30">

                {/* Left - Product Details */}
                <div className="flex flex-col gap-2 sm:gap-3 text-center sm:text-left w-full sm:w-auto order-3 sm:order-1 mt-4 sm:mt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase sm:w-24">Category:</span>
                    <span className="text-sm font-medium text-gray-900">{product?.category}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase sm:w-24">Harvested:</span>
                    <span className="text-sm font-medium text-gray-900">{harvestDate}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase sm:w-24">Product ID:</span>
                    <span className="text-xs font-mono font-medium text-gray-900">{product?.product_id?.slice(-12)}</span>
                  </div>
                </div>

                {/* Center - Blockchain Seal */}
                <div className="flex flex-col items-center justify-center order-1 sm:order-2">
                  {isVerified ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#064e3b] text-[#c0a062] rounded-full border-2 border-[#c0a062] shadow-sm mb-2">
                        <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider text-[#064e3b] uppercase">Verified on Blockchain</span>
                      <span className="text-[9px] font-mono text-gray-500 mt-1">Tx: {blockchainData?.transaction_hash?.slice(0, 10)}...{blockchainData?.transaction_hash?.slice(-8)}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 text-gray-600 rounded-full border-2 border-gray-300 shadow-sm mb-2">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider text-gray-600 uppercase">Platform Verified</span>
                    </div>
                  )}
                </div>

                {/* Right - QR Code */}
                <div className="flex flex-col items-center order-2 sm:order-3">
                  <div className="p-1 sm:p-1.5 bg-white border border-[#c0a062] shadow-sm mb-1">
                    <QRCodeSVG
                      value={qrString}
                      size={60}
                      level="H"
                      includeMargin={false}
                      fgColor="#111827"
                    />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-semibold tracking-widest text-gray-500 uppercase mt-1">Scan to Verify</span>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
