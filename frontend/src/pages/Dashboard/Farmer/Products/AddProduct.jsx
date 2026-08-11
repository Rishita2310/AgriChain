import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Package, Leaf, MapPin, Image as ImageIcon, CheckCircle, 
  ChevronRight, ChevronLeft, Save, UploadCloud, LocateFixed,
  Trash2, AlertTriangle, ArrowLeft, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, getProductImageUrl } from '@/services/product.service';
import { profileService } from '@/services/profile.service';

const INITIAL_STATE = {
  product_name: '',
  category: '',
  sub_category: '',
  variety: '',
  description: '',
  quantity: '',
  unit: 'Kg',
  price: '',
  market_price: '',
  discount_price: '',
  negotiable: false,
  organic: false,
  certificate: '',
  harvest_date: '',
  expected_shelf_life: '1 Week',
  ready_for_pickup: true,
  images: [],
  location: {
    village: '',
    city: '',
    district: '',
    state: '',
    country: '',
    pin_code: '',
    latitude: '',
    longitude: ''
  },
  availability: {
    from: '',
    until: '',
    min_order_quantity: '',
    max_order_quantity: ''
  },
  delivery_options: {
    pickup_available: true,
    home_delivery: false,
    delivery_radius_km: '',
    transportation_available: false
  },
  quality: {
    freshness: 'Excellent',
    moisture_level: '',
    storage_type: 'Normal Storage'
  }
};

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Flowers', 'Herbs', 'Seeds', 'Dairy', 'Organic Products', 'Other'];
const UNITS = ['Kg', 'Gram', 'Ton', 'Quintal', 'Piece', 'Dozen', 'Bag', 'Box', 'Litre', 'Packet'];

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    if (!isEditMode) {
      const saved = localStorage.getItem('productDraft');
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    }
    return INITIAL_STATE;
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch product data if in edit mode
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getById(id);
        const product = data.product || data;
        
        if (isMounted && product) {
          setFormData({
            product_name: product.product_name || '',
            category: product.category || '',
            sub_category: product.sub_category || '',
            variety: product.variety || '',
            description: product.description || '',
            quantity: product.quantity !== undefined ? String(product.quantity) : '',
            unit: product.unit || 'Kg',
            price: product.price !== undefined ? String(product.price) : '',
            market_price: product.market_price !== undefined && product.market_price !== null ? String(product.market_price) : '',
            discount_price: product.discount_price !== undefined && product.discount_price !== null ? String(product.discount_price) : '',
            negotiable: Boolean(product.negotiable),
            organic: Boolean(product.organic),
            certificate: product.certificate || '',
            harvest_date: product.harvest_date || '',
            expected_shelf_life: product.expected_shelf_life || '1 Week',
            ready_for_pickup: product.ready_for_pickup !== undefined ? Boolean(product.ready_for_pickup) : true,
            images: Array.isArray(product.images) ? product.images : [],
            location: {
              village: product.location?.village || '',
              city: product.location?.city || '',
              district: product.location?.district || '',
              state: product.location?.state || '',
              country: product.location?.country || '',
              pin_code: product.location?.pin_code || '',
              latitude: product.location?.latitude ? String(product.location.latitude) : '',
              longitude: product.location?.longitude ? String(product.location.longitude) : ''
            },
            availability: {
              from: product.availability?.from || '',
              until: product.availability?.until || '',
              min_order_quantity: product.availability?.min_order_quantity ? String(product.availability.min_order_quantity) : '',
              max_order_quantity: product.availability?.max_order_quantity ? String(product.availability.max_order_quantity) : ''
            },
            delivery_options: {
              pickup_available: product.delivery_options?.pickup_available !== undefined ? Boolean(product.delivery_options.pickup_available) : true,
              home_delivery: Boolean(product.delivery_options?.home_delivery),
              delivery_radius_km: product.delivery_options?.delivery_radius_km ? String(product.delivery_options.delivery_radius_km) : '',
              transportation_available: Boolean(product.delivery_options?.transportation_available)
            },
            quality: {
              freshness: product.quality?.freshness || 'Excellent',
              moisture_level: product.quality?.moisture_level || '',
              storage_type: product.quality?.storage_type || 'Normal Storage'
            }
          });
        }
      } catch (err) {
        toast.error('Failed to load product details for editing');
        navigate('/farmer/products');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // Auto-save draft only when creating a new product
  useEffect(() => {
    if (isEditMode) return;
    const interval = setInterval(() => {
      localStorage.setItem('productDraft', JSON.stringify(formData));
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [formData, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [name]: value }
    }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const processImageFiles = async (files) => {
    if (!files.length) return;
    
    if (formData.images.length + files.length > 10) {
      toast.error("You can only upload up to 10 images");
      return;
    }
    
    setIsUploading(true);
    try {
      const urls = [];
      for (let file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max 5MB allowed.`);
          continue;
        }
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File ${file.name} is not a supported image type.`);
          continue;
        }
        const res = await profileService.uploadFile(file);
        urls.push(res.url);
      }
      
      if (urls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...urls]
        }));
        toast.success("Images uploaded successfully");
      }
    } catch (err) {
      toast.error("Failed to upload some images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    await processImageFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if we're leaving the drop zone entirely (not entering a child)
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processImageFiles(files);
  };
  
  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const formatPayload = (isDraft) => {
    return {
      ...formData,
      quantity: parseFloat(formData.quantity) || 0,
      price: parseFloat(formData.price) || 0,
      market_price: formData.market_price ? parseFloat(formData.market_price) : null,
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      save_as_draft: isDraft,
      location: {
        ...formData.location,
        latitude: formData.location.latitude ? parseFloat(formData.location.latitude) : null,
        longitude: formData.location.longitude ? parseFloat(formData.location.longitude) : null,
      },
      availability: {
        ...formData.availability,
        min_order_quantity: formData.availability.min_order_quantity ? parseFloat(formData.availability.min_order_quantity) : null,
        max_order_quantity: formData.availability.max_order_quantity ? parseFloat(formData.availability.max_order_quantity) : null,
      },
      delivery_options: {
        ...formData.delivery_options,
        delivery_radius_km: formData.delivery_options.delivery_radius_km ? parseInt(formData.delivery_options.delivery_radius_km, 10) : null,
      }
    };
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);
      const payload = formatPayload(true);
      if (isEditMode) {
        await productService.update(id, payload);
        toast.success('Product updated as draft!');
      } else {
        await productService.create(payload);
        localStorage.removeItem('productDraft');
        toast.success('Draft saved successfully!');
      }
      navigate('/farmer/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishOrUpdate = async () => {
    if (!formData.product_name.trim()) {
      toast.error('Product name is required');
      setStep(1);
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      setStep(1);
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      setStep(2);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = formatPayload(false);
      
      if (isEditMode) {
        await productService.update(id, payload);
        toast.success('Product updated successfully!');
        navigate('/farmer/products');
      } else {
        const res = await productService.create(payload);
        localStorage.removeItem('productDraft');
        navigate('/farmer/products/success', { state: { productId: res.product_id } });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || (isEditMode ? 'Failed to update product' : 'Failed to publish product'));
    } finally {
      setIsSubmitting(false);
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Pricing' },
        { num: 3, label: 'Images' },
        { num: 4, label: 'Location' },
        { num: 5, label: 'Preview' }
      ].map((s, idx) => (
        <div key={s.num} className="flex flex-col items-center relative w-full">
          <button
            type="button"
            onClick={() => setStep(s.num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all cursor-pointer ${
              step === s.num
                ? 'bg-primary text-white ring-4 ring-primary/20 scale-105'
                : step > s.num
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
          </button>
          <div className="text-xs mt-2 font-medium text-gray-600 hidden md:block">{s.label}</div>
          {idx < 4 && (
            <div className={`absolute top-5 left-1/2 w-full h-1 -z-0 ${
              step > s.num ? 'bg-primary' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            to="/farmer/products"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
            title="Back to Product List"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              {isEditMode && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Editing Mode
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditMode
                ? 'Modify your crop details, pricing, harvest date, and media.'
                : 'Publish fresh farm produce directly to buyers with blockchain verification.'}
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}

          <button 
            type="button"
            onClick={handleSaveDraft} 
            disabled={isSubmitting} 
            className="text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm font-medium flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Form Area */}
        <div className="lg:w-2/3 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
          
          {renderStepIndicator()}

          <div className="flex-grow">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Basic Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    name="product_name" 
                    value={formData.product_name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    placeholder="e.g. Fresh Organic Tomatoes" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
                    <input 
                      type="text" 
                      name="variety" 
                      value={formData.variety} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="e.g. Roma / Hybrid" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="4" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    placeholder="Describe your produce quality, taste, freshness, pesticide usage..."
                  />
                  <div className="text-xs text-gray-400 text-right mt-1">{formData.description.length}/1000</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <input 
                    type="checkbox" 
                    id="organic" 
                    name="organic" 
                    checked={formData.organic} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" 
                  />
                  <label htmlFor="organic" className="text-sm font-medium text-emerald-950 flex items-center gap-1.5 cursor-pointer">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    This is a 100% Organic certified produce
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Pricing & Quantity */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Pricing & Quantity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Stock / Quantity *</label>
                    <input 
                      type="number" 
                      name="quantity" 
                      value={formData.quantity} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                      placeholder="0" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement *</label>
                    <select 
                      name="unit" 
                      value={formData.unit} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Selling Price (₹) *</label>
                    <input 
                      type="number" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Market Benchmark Price (Optional)</label>
                    <input 
                      type="number" 
                      name="market_price" 
                      value={formData.market_price} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="negotiable" 
                    name="negotiable" 
                    checked={formData.negotiable} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" 
                  />
                  <label htmlFor="negotiable" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Price is negotiable for bulk orders
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Images */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Product Images</h2>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center ${
                    isDragging 
                      ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10' 
                      : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <UploadCloud className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                  {isDragging ? (
                    <p className="text-sm text-primary font-semibold">Drop your images here!</p>
                  ) : (
                    <label className="relative cursor-pointer">
                      <span className="text-sm text-primary font-semibold hover:text-primary-dark">
                        Click to browse or drag and drop images
                      </span>
                      <input 
                        type="file" 
                        multiple 
                        className="sr-only" 
                        onChange={handleImageUpload} 
                        accept="image/png, image/jpeg, image/webp" 
                        disabled={isUploading} 
                      />
                    </label>
                  )}
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB (Max 10 images)</p>
                  {isUploading && (
                    <p className="text-sm text-primary mt-3 animate-pulse flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin w-4 h-4" /> Uploading photos...
                    </p>
                  )}
                </div>

                <div className="flex gap-4 flex-wrap mt-4">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden group shadow-sm">
                      <img src={getProductImageUrl(url)} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage(idx)} 
                        className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-rose-50 rounded-full p-1 shadow text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length === 0 && (
                    <div className="w-24 h-24 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Location & Harvest */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-lg font-bold text-gray-800">Location & Harvest Details</h2>
                  <button 
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        toast.loading("Detecting your location...", { id: "geo" });
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setFormData(prev => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                latitude: String(pos.coords.latitude),
                                longitude: String(pos.coords.longitude)
                              }
                            }));
                            toast.success("GPS coordinates detected!", { id: "geo" });
                          },
                          () => {
                            toast.error("Could not fetch location automatically. Please type below.", { id: "geo" });
                          }
                        );
                      }
                    }}
                    className="flex items-center gap-1.5 text-primary font-medium text-xs bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <LocateFixed className="w-3.5 h-3.5" /> Auto GPS
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City / Village / Mandi *</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.location.city} 
                      onChange={handleLocationChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                      placeholder="e.g. Nashik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={formData.location.state} 
                      onChange={handleLocationChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date *</label>
                    <input 
                      type="date" 
                      name="harvest_date" 
                      value={formData.harvest_date} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Shelf Life</label>
                    <select 
                      name="expected_shelf_life" 
                      value={formData.expected_shelf_life} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {['1 Day', '3 Days', '5 Days', '1 Week', '2 Weeks', '1 Month', '3 Months'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Preview */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Final Review & Summary</h2>
                <p className="text-gray-600 text-sm">
                  {isEditMode 
                    ? 'Review the updated details on the right live preview before saving changes.' 
                    : 'Review your product details before publishing to AgriChain marketplace.'}
                </p>
                
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3 mt-4">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 text-sm">Blockchain Verified Traceability</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      {isEditMode
                        ? 'Updated information will be updated in the AgriChain catalog with complete audit trail.'
                        : 'Publishing will create a tamper-proof record securing origin and harvest integrity.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-5 border-t border-gray-100 flex justify-between items-center">
            <button 
              type="button"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                step === 1 ? 'opacity-0 cursor-default' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            {step < 5 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handlePublishOrUpdate}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {isEditMode ? 'Update Product' : 'Publish Product'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Live Preview Area */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-primary" /> Live Card Preview
              </h3>
              <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                Buyer View
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-2xl aspect-video border border-gray-100 flex items-center justify-center overflow-hidden relative shadow-inner">
               {formData.images.length > 0 ? (
                 <img src={getProductImageUrl(formData.images[0])} alt="preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="text-gray-400 flex flex-col items-center gap-2">
                   <ImageIcon className="w-8 h-8 opacity-40" />
                   <span className="text-xs">No image provided</span>
                 </div>
               )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-base text-gray-900 break-words leading-tight">
                  {formData.product_name || 'Product Name'}
                </h4>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-primary whitespace-nowrap">₹{formData.price || '0'}</div>
                  <div className="text-xs text-gray-400">/{formData.unit}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                  {formData.category || 'Category'}
                </span>
                {formData.variety && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                    {formData.variety}
                  </span>
                )}
                {formData.organic && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> Organic
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Available Stock:</span>
                  <span className="font-bold text-gray-800">{formData.quantity || 0} {formData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Harvest Date:</span>
                  <span className="font-semibold text-gray-700">{formData.harvest_date || 'Not set'}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium text-gray-800 text-right flex items-center gap-1 justify-end">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {formData.location.city ? `${formData.location.city}, ${formData.location.state}` : 'Not set'}
                  </span>
                </div>
              </div>
              
              {formData.description && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    {formData.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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
                Are you sure you want to delete <strong className="text-gray-800 font-semibold">{formData.product_name}</strong>? This action cannot be undone.
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
  );
}
