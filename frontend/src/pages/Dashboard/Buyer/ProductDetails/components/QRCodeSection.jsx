import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, FileBadge } from 'lucide-react';
import CertificateModal from './CertificateModal';

export default function QRCodeSection({ qrData, product, farmer, blockchainData }) {
  const [isCertOpen, setIsCertOpen] = useState(false);

  if (!qrData) return null;

  const qrString = JSON.stringify(qrData);

  const handleDownload = () => {
    const svg = document.getElementById("product-qrcode");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${qrData.product_id}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <>
      <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col md:flex-row items-center gap-12 justify-between">
        <div>
          <div className="flex items-center gap-3 text-emerald-700 mb-4">
            <QrCode className="w-8 h-8" />
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Product Traceability QR</h2>
          </div>
          <p className="text-gray-500 mb-8 max-w-md text-[15px] leading-loose">
            Scan this QR code with any smartphone to instantly view the blockchain verification record, origin details, and harvest timestamps for this specific product batch.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setIsCertOpen(true)}
              className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-600/20"
            >
              <FileBadge className="w-4 h-4" /> View Certificate
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-6 py-3.5 rounded-2xl transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Download QR Code
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <QRCodeSVG 
              id="product-qrcode"
              value={qrString} 
              size={180} 
              level="H" 
              includeMargin={true}
              fgColor="#111827"
            />
          </div>
          <span className="text-xs text-gray-400 mt-3 font-mono">ID: {qrData.product_id.slice(-8)}</span>
        </div>
      </div>

      <CertificateModal 
        isOpen={isCertOpen} 
        onClose={() => setIsCertOpen(false)} 
        product={product} 
        farmer={farmer} 
        qrData={qrData} 
        blockchainData={blockchainData} 
      />
    </>
  );
}
