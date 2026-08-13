import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, Home, Loader2, AlertTriangle, ArrowLeft, 
  Edit3, Trash2, ShieldCheck, RefreshCw, FileText, MapPin 
} from 'lucide-react';
import { productService } from '@/services/product.service';
import { useAuthStore } from '@/store/useAuthStore';
import ImageGallery from './components/ImageGallery';
import ProductInfo from './components/ProductInfo';
import FarmerInfoCard from './components/FarmerInfoCard';
import BlockchainVerificationCard from './components/BlockchainVerificationCard';
import ReviewsSection from './components/ReviewsSection';
import PurchaseCard from './components/PurchaseCard';
import QRCodeSection from './components/QRCodeSection';
import SimilarProducts from './components/SimilarProducts';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const [productRes, reviewsRes, similarRes, qrRes] = await Promise.all([
          productService.getById(id),
          productService.getReviews(id).catch(() => []),
          productService.getSimilar(id).catch(() => []),
          productService.getQRCodeData(id).catch(() => null)
        ]);
        
        setDetails(productRes);
        setReviews(reviewsRes);
        setSimilar(similarRes);
        setQrData(qrRes);

        // Fetch blockchain data if hash exists
        if (productRes.product?.blockchain_hash) {
          fetchBlockchainData(productRes.product.product_id);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchBlockchainData = async (productId) => {
    setVerifying(true);
    try {
      const bData = await productService.getBlockchainVerification(productId);
      setBlockchainData(bData);
    } catch (e) {
      console.error("Blockchain verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await productService.delete(id);
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      navigate('/farmer/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (error || !details?.product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-8">The product you are looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/marketplace')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>
      </div>
    );
  }

  const { product, farmer, review_stats } = details;
  const isOwnerFarmer = user?.role === 'Farmer' && (
    !product.wallet_address || 
    user?.wallet_address?.toLowerCase() === product.wallet_address?.toLowerCase() ||
    user?.role === 'Farmer'
  );

  const productIdentifier = product.product_id || product._id || id;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="bg-gray-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 pb-24 relative overflow-x-hidden">
        {/* Soft elegant background glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-100/40 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-0 w-[400px] h-[400px] rounded-full bg-teal-50/60 blur-[100px] pointer-events-none" />
        
        {/* Farmer Owner Management Bar */}
        {isOwnerFarmer && (
          <div className="mb-8 p-5 rounded-2xl bg-white border border-amber-200/60 flex flex-wrap items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative z-20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Owner Controls</h4>
                <p className="text-xs text-gray-500 mt-0.5">Manage your product listing details or remove it from the marketplace.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/farmer/products/edit/${productIdentifier}`}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-xl"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Minimalist Breadcrumb */}
        <nav className="flex items-center gap-2.5 text-xs text-gray-400 font-medium mb-10 overflow-x-auto whitespace-nowrap hide-scrollbar relative z-20 uppercase tracking-widest">
          <Link to="/" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/marketplace" className="hover:text-gray-900 transition-colors">Marketplace</Link>
          <span className="text-gray-300">/</span>
          <span className="hover:text-gray-900 transition-colors cursor-pointer">{product.category}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold truncate max-w-[200px]">{product.product_name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14 relative z-20">
          {/* Main Content Area */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 min-w-0 space-y-16"
          >
            
            {/* Top Section: Images + Quick Info */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-10">
              <div className="md:w-1/2 lg:w-5/12 shrink-0">
                <ImageGallery images={product.images} productName={product.product_name} />
              </div>
              <div className="md:w-1/2 lg:w-7/12 flex flex-col justify-center">
                <ProductInfo product={product} reviewStats={review_stats} />
              </div>
            </motion.div>

            {/* Product Description & Specs - Redesigned to be highly minimalist */}
            <motion.section variants={itemVariants} className="bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-gray-100">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">The Story</h3>
                  <p className="text-gray-700 leading-loose whitespace-pre-line text-[15px]">
                    {product.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Specifications</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Category</span>
                      <span className="font-bold text-gray-900 text-sm">{product.category}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Variety</span>
                      <span className="font-bold text-gray-900 text-sm">{product.variety || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Farming Method</span>
                      <span className="font-bold text-gray-900 text-sm">{product.organic ? 'Organic Certified' : 'Conventional'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Storage</span>
                      <span className="font-bold text-gray-900 text-sm">{product.quality?.storage_type || 'Normal Storage'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">Origin</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {product.location?.city ? `${product.location.city}, ${product.location.state}` : (product.location?.village || 'Local Farm')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Farmer Info */}
            <motion.section variants={itemVariants}>
              <FarmerInfoCard farmer={farmer} />
            </motion.section>

          {/* Blockchain Verification */}
          {product.blockchain_hash && (
            <motion.section variants={itemVariants}>
              <BlockchainVerificationCard 
                verificationData={blockchainData} 
                loading={verifying} 
                onVerify={() => fetchBlockchainData(product.product_id)}
              />
            </motion.section>
          )}

          {/* QR Code */}
          <motion.section variants={itemVariants}>
            <QRCodeSection 
              qrData={qrData} 
              product={product} 
              farmer={farmer} 
              blockchainData={blockchainData} 
            />
          </motion.section>

          {/* Reviews */}
          <motion.section variants={itemVariants}>
            <ReviewsSection reviews={reviews} stats={review_stats} />
          </motion.section>

          {/* Similar Products */}
          <motion.section variants={itemVariants}>
            <SimilarProducts products={similar} />
          </motion.section>

        </motion.div>

        {/* Right Sidebar: Purchase Options */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}
          className="w-full lg:w-[340px] shrink-0"
        >
          <PurchaseCard product={product} />
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-gray-800 font-semibold">{product.product_name}</strong>? This will remove the listing completely from the marketplace.
              </p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}
