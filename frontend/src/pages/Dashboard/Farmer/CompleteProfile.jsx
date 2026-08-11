import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Wallet, 
  User, 
  Home, 
  FileText, 
  Image as ImageIcon, 
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  X,
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Languages
} from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';
import axios from '@/services/api';
import { profileService } from '../../../services/profile.service';
import { BASE_URL } from '@/services/api';

export default function CompleteProfile() {
  const { user, updateCompletion, token, initAuth } = useAuthStore();
  
  // Local state for profile data (in real app, fetch from backend if not in store)
  const fd = user?.farmer_details || {};
  const [completion, setCompletion] = useState(fd.profile_completion_percentage || 0);
  const [activeModal, setActiveModal] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || '',
    preferred_language: user?.preferred_language || 'English',
  });

  const [farmForm, setFarmForm] = useState({
    farm_name: fd?.farm_name || '',
    farm_address: fd?.farm_address || '',
    farm_size: fd?.farm_size || '',
    experience: fd?.experience || '',
    organic_farming: fd?.organic_farming || false,
    primary_crops: fd?.primary_crops?.join(', ') || '',
  });

  const [docsForm, setDocsForm] = useState({
    document_type: 'Land Ownership',
  });
  const [docsFile, setDocsFile] = useState(null);

  const [certForm, setCertForm] = useState({
    name: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    certificate_number: '',
  });
  const [certFile, setCertFile] = useState(null);

  const [idForm, setIdForm] = useState({
    id_type: 'Aadhaar',
  });
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  // Drag-and-drop states for each upload zone
  const [dragStates, setDragStates] = useState({
    docs: false,
    cert: false,
    idFront: false,
    idBack: false,
    images: false,
  });

  const setDragActive = (zone, active) => {
    setDragStates(prev => ({ ...prev, [zone]: active }));
  };

  const makeDragHandlers = (zone, onFileDrop) => ({
    onDragOver: (e) => { e.preventDefault(); e.stopPropagation(); },
    onDragEnter: (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(zone, true); },
    onDragLeave: (e) => {
      e.preventDefault(); e.stopPropagation();
      if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
        setDragActive(zone, false);
      }
    },
    onDrop: (e) => {
      e.preventDefault(); e.stopPropagation();
      setDragActive(zone, false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFileDrop(files);
    },
  });

  const getDropZoneClass = (zone) => dragStates[zone]
    ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10'
    : 'border-gray-300 hover:border-primary';

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await profileService.updatePersonal(personalForm);
      toast.success(res.message || "Personal info updated");
      
      updateCompletion(res.completion_percentage, fd?.profile_status);
      
      const profileRes = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      initAuth(token, profileRes.data);
      
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update personal info");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFarmSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...farmForm,
        farm_size: parseFloat(farmForm.farm_size) || 0,
        primary_crops: farmForm.primary_crops.split(',').map(c => c.trim()).filter(c => c),
      };
      const res = await profileService.updateFarm(payload);
      toast.success(res.message || "Farm info updated");
      
      updateCompletion(res.completion_percentage, fd?.profile_status);
      
      const profileRes = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      initAuth(token, profileRes.data);
      
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update farm info");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocsSubmit = async (e) => {
    e.preventDefault();
    if (!docsFile) {
       toast.error("Please select a file to upload");
       return;
    }
    setIsSubmitting(true);
    try {
      const uploadRes = await profileService.uploadFile(docsFile);
      
      const currentDocs = fd?.verification_documents || [];
      const payload = {
        verification_documents: [...currentDocs, { document_type: docsForm.document_type, url: uploadRes.url, status: "Pending" }]
      };
      
      const res = await profileService.updateDocuments(payload);
      toast.success(res.message || "Documents updated");
      
      updateCompletion(res.completion_percentage, fd?.profile_status);
      
      const profileRes = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      initAuth(token, profileRes.data);
      
      setDocsFile(null);
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    if (!certFile) {
       toast.error("Please select a certificate file to upload");
       return;
    }
    setIsSubmitting(true);
    try {
      const uploadRes = await profileService.uploadFile(certFile);
      
      const currentCerts = fd?.certificates || [];
      const payload = {
        certificates: [...currentCerts, { 
           ...certForm, 
           url: uploadRes.url,
           status: "Pending" 
        }]
      };
      
      const res = await profileService.updateDocuments(payload);
      toast.success(res.message || "Certificate updated");
      
      updateCompletion(res.completion_percentage, fd?.profile_status);
      
      const profileRes = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      initAuth(token, profileRes.data);
      
      setCertFile(null);
      setCertForm({
        name: '',
        issuing_authority: '',
        issue_date: '',
        expiry_date: '',
        certificate_number: '',
      });
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdSubmit = async (e) => {
    e.preventDefault();
    if (!idFrontFile || !idBackFile) {
       toast.error("Please select both front and back images of the ID");
       return;
    }
    setIsSubmitting(true);
    try {
      const frontUpload = await profileService.uploadFile(idFrontFile);
      const backUpload = await profileService.uploadFile(idBackFile);
      
      const payload = {
        government_id: {
           id_type: idForm.id_type,
           front_image: frontUpload.url,
           back_image: backUpload.url,
           status: "Pending"
        }
      };
      
      const res = await profileService.updateDocuments(payload);
      toast.success(res.message || "Government ID updated");
      
      updateCompletion(res.completion_percentage, fd?.profile_status);
      
      const profileRes = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      initAuth(token, profileRes.data);
      
      setIdFrontFile(null);
      setIdBackFile(null);
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update Government ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesSubmit = async (e) => {
    e.preventDefault();
    if (!imageFiles || imageFiles.length === 0) {
       toast.error("Please select at least one image to upload");
       return;
    }
    setIsSubmitting(true);
    try {
      const uploadedUrls = [];
      for (let file of imageFiles) {
         const uploadRes = await profileService.uploadFile(file);
         uploadedUrls.push(uploadRes.url);
      }
      
      const currentImages = fd?.farm_images || [];
      const payload = {
        farm_images: [...currentImages, ...uploadedUrls]
      };
      
      const res = await profileService.updateDocuments(payload);
      toast.success(res.message || "Farm images updated");
      
      updateCompletion(res.completion_percentage, fd?.profile_status);
      
      const profileRes = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      initAuth(token, profileRes.data);
      
      setImageFiles([]);
      setActiveModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload images");
    } finally {
      setIsSubmitting(false);
    }
  };



  // Derive section statuses based on completion logic
  const isPersonalComplete = !!(user?.full_name && user?.email && user?.phone_number && user?.country);
  const isFarmComplete = !!(fd.farm_name && fd.farm_address && fd.farm_size > 0 && fd.primary_crops?.length > 0);
  const isDocsComplete = !!(fd.verification_documents?.length > 0);
  const isImagesComplete = !!(fd.farm_images?.length > 0);
  const isGovtIdComplete = !!(fd.government_id);
  const isCertsComplete = !!(fd.certificates?.length > 0);
  
  const sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      desc: 'Full name, contact details, and location',
      icon: <User className="w-6 h-6 text-blue-500" />,
      completed: isPersonalComplete,
      required: true
    },
    {
      id: 'wallet',
      title: 'Wallet Verification',
      desc: 'Connect your crypto wallet',
      icon: <Wallet className="w-6 h-6 text-purple-500" />,
      completed: true, // Assuming true if logged in
      required: true
    },
    {
      id: 'farm',
      title: 'Farm Information',
      desc: 'Farm size, crops, and experience',
      icon: <Home className="w-6 h-6 text-emerald-500" />,
      completed: isFarmComplete,
      required: true
    },
    {
      id: 'documents',
      title: 'Verification Documents',
      desc: 'Upload land ownership or lease agreements',
      icon: <FileText className="w-6 h-6 text-amber-500" />,
      completed: isDocsComplete,
      required: true
    },
    {
      id: 'images',
      title: 'Farm Images',
      desc: 'Upload 1-10 images of your farm',
      icon: <ImageIcon className="w-6 h-6 text-rose-500" />,
      completed: isImagesComplete,
      required: true
    },
    {
      id: 'id',
      title: 'Government ID',
      desc: 'Aadhaar, PAN, or National ID',
      icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
      completed: isGovtIdComplete,
      required: false
    },
    {
      id: 'certs',
      title: 'Certificates',
      desc: 'Organic or Quality certificates',
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      completed: isCertsComplete,
      required: false
    }
  ];

  const handleAction = (id) => {
    if (id === 'wallet') {
      toast('Wallet already connected!', { icon: '👛' });
      return;
    }
    setActiveModal(id);
  };

  const getProgressColor = (val) => {
    if (val <= 40) return 'text-red-500 border-red-500';
    if (val <= 70) return 'text-orange-500 border-orange-500';
    if (val < 100) return 'text-blue-500 border-blue-500';
    return 'text-green-500 border-green-500';
  };

  const getProgressBg = (val) => {
    if (val <= 40) return 'bg-red-500';
    if (val <= 70) return 'bg-orange-500';
    if (val < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const submitProfile = () => {
    if (completion < 100) {
      toast.error("Please complete all required sections first.");
      return;
    }
    toast.success("Profile submitted successfully! Verification pending.");
    updateCompletion(100, "PendingVerification");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-500 max-w-xl">
            Complete your farmer profile to unlock all AgriChain features and build trust with buyers.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-500 mb-1">Profile Completion</div>
            <div className={`text-3xl font-bold ${getProgressColor(completion).split(' ')[0]}`}>
              {completion}%
            </div>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="36" className="stroke-gray-100" strokeWidth="8" fill="none" />
              <circle 
                cx="40" cy="40" r="36" 
                className={`stroke-current ${getProgressColor(completion).split(' ')[0]}`}
                strokeWidth="8" 
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - completion / 100)}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Checklist */}
        <div className="lg:col-span-2 space-y-4">
          {sections.map((sec) => (
            <div key={sec.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
              <div className="p-3 bg-gray-50 rounded-xl">
                {sec.icon}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{sec.title}</h3>
                  {!sec.required && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional</span>}
                </div>
                <p className="text-sm text-gray-500">{sec.desc}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1.5 text-sm font-medium ${sec.completed ? 'text-green-600' : 'text-gray-400'}`}>
                  {sec.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  {sec.completed ? 'Completed' : 'Incomplete'}
                </div>
                <button 
                  onClick={() => handleAction(sec.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sec.completed 
                      ? 'bg-gray-50 text-gray-700 hover:bg-gray-100' 
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {sec.id === 'wallet' ? (sec.completed ? 'Connected' : 'Connect') : (sec.completed ? 'Edit' : 'Add Info')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Col - Summary & Benefits */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">{completion}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${getProgressBg(completion)} transition-all duration-500`} style={{ width: `${completion}%` }}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Verified Sections</span>
                <span className="font-medium text-gray-900">{sections.filter(s => s.completed && s.required).length} / 5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estimated Time</span>
                <span className="font-medium text-amber-600 flex items-center gap-1"><Clock className="w-4 h-4"/> 5 mins left</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
            <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Why Complete Profile?
            </h3>
            <ul className="space-y-3">
              {[
                "Verified farmers gain more buyer trust",
                "Higher visibility in marketplace",
                "Eligible for premium badges",
                "Faster payment processing"
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
             <button 
                onClick={submitProfile}
                disabled={completion < 100}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  completion === 100 
                  ? 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit for Verification
             </button>
             <button className="w-full py-3 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                Save & Continue Later
             </button>
          </div>
        </div>
      </div>
      
      {/* Modals placeholders */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6 capitalize">{activeModal} Information</h2>
            {activeModal === 'personal' ? (
              <form onSubmit={handlePersonalSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Full Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" required value={personalForm.full_name} onChange={e => setPersonalForm({...personalForm, full_name: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="email" required value={personalForm.email} onChange={e => setPersonalForm({...personalForm, email: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" required value={personalForm.phone_number} onChange={e => setPersonalForm({...personalForm, phone_number: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="+1 234 567 890" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Country *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" required value={personalForm.country} onChange={e => setPersonalForm({...personalForm, country: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="United States" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" value={personalForm.state} onChange={e => setPersonalForm({...personalForm, state: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="California" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" value={personalForm.city} onChange={e => setPersonalForm({...personalForm, city: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="San Francisco" />
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Preferred Language *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Languages className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" required value={personalForm.preferred_language} onChange={e => setPersonalForm({...personalForm, preferred_language: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="English" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : activeModal === 'farm' ? (
              <form onSubmit={handleFarmSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Farm Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" required value={farmForm.farm_name} onChange={e => setFarmForm({...farmForm, farm_name: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Green Valley Farm" />
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Farm Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" required value={farmForm.farm_address} onChange={e => setFarmForm({...farmForm, farm_address: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="123 Farm Road, Village" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Farm Size (Acres) *</label>
                    <div className="relative">
                      <input type="number" required min="0" step="0.1" value={farmForm.farm_size} onChange={e => setFarmForm({...farmForm, farm_size: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="5.5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Experience (Years)</label>
                    <div className="relative">
                      <input type="text" value={farmForm.experience} onChange={e => setFarmForm({...farmForm, experience: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="10 Years" />
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Primary Crops (comma separated) *</label>
                    <div className="relative">
                      <input type="text" required value={farmForm.primary_crops} onChange={e => setFarmForm({...farmForm, primary_crops: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Wheat, Corn, Soybeans" />
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={farmForm.organic_farming} onChange={e => setFarmForm({...farmForm, organic_farming: e.target.checked})} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                      <span className="text-sm font-medium text-gray-700">I practice organic farming</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : activeModal === 'documents' ? (
              <form onSubmit={handleDocsSubmit} className="space-y-4">
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Document Type *</label>
                    <div className="relative">
                      <select required value={docsForm.document_type} onChange={e => setDocsForm({...docsForm, document_type: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white">
                        <option value="Land Ownership">Land Ownership</option>
                        <option value="Lease Agreement">Lease Agreement</option>
                        <option value="Utility Bill">Utility Bill</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Upload Document *</label>
                    <div
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 ${getDropZoneClass('docs')}`}
                      {...makeDragHandlers('docs', (files) => setDocsFile(files[0]))}
                    >
                      <div className="space-y-1 text-center">
                        <FileText className={`mx-auto h-12 w-12 transition-colors ${dragStates.docs ? 'text-primary' : 'text-gray-400'}`} />
                        {dragStates.docs ? (
                          <p className="text-sm text-primary font-semibold">Drop your file here!</p>
                        ) : (
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                              <span>Upload a file</span>
                              <input type="file" required className="sr-only" onChange={e => setDocsFile(e.target.files[0])} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {docsFile ? docsFile.name : "PNG, JPG, PDF up to 10MB"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {fd?.verification_documents?.length > 0 && (
                     <div className="mt-4">
                       <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                       <ul className="space-y-2">
                         {fd.verification_documents.map((doc, idx) => (
                           <li key={idx} className="text-sm flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                             <CheckCircle2 className="w-4 h-4 text-green-500" />
                             {doc.document_type}
                           </li>
                         ))}
                       </ul>
                     </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => { setActiveModal(null); setDocsFile(null); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload & Save'}
                  </button>
                </div>
              </form>
            ) : activeModal === 'certs' ? (
              <form onSubmit={handleCertSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Certificate Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Award className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" required value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Organic Farming Certification" />
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Issuing Authority *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="text" required value={certForm.issuing_authority} onChange={e => setCertForm({...certForm, issuing_authority: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="USDA" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Certificate Number *</label>
                    <div className="relative">
                      <input type="text" required value={certForm.certificate_number} onChange={e => setCertForm({...certForm, certificate_number: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="CERT-123456" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Issue Date *</label>
                    <div className="relative">
                      <input type="date" required value={certForm.issue_date} onChange={e => setCertForm({...certForm, issue_date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                    <div className="relative">
                      <input type="date" value={certForm.expiry_date} onChange={e => setCertForm({...certForm, expiry_date: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div className="space-y-1 sm:col-span-2 mt-2">
                    <label className="text-sm font-medium text-gray-700">Upload Certificate *</label>
                    <div
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 ${getDropZoneClass('cert')}`}
                      {...makeDragHandlers('cert', (files) => setCertFile(files[0]))}
                    >
                      <div className="space-y-1 text-center">
                        <FileText className={`mx-auto h-12 w-12 transition-colors ${dragStates.cert ? 'text-primary' : 'text-gray-400'}`} />
                        {dragStates.cert ? (
                          <p className="text-sm text-primary font-semibold">Drop your file here!</p>
                        ) : (
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                              <span>Upload a file</span>
                              <input type="file" required className="sr-only" onChange={e => setCertFile(e.target.files[0])} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {certFile ? certFile.name : "PNG, JPG, PDF up to 10MB"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {fd?.certificates?.length > 0 && (
                     <div className="sm:col-span-2 mt-4">
                       <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Certificates:</h4>
                       <ul className="space-y-2">
                         {fd.certificates.map((cert, idx) => (
                           <li key={idx} className="text-sm flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                             <Award className="w-4 h-4 text-yellow-500" />
                             {cert.name} ({cert.status || "Pending"})
                           </li>
                         ))}
                       </ul>
                     </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => { setActiveModal(null); setCertFile(null); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload & Save'}
                  </button>
                </div>
              </form>
            ) : activeModal === 'id' ? (
              <form onSubmit={handleIdSubmit} className="space-y-4">
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">ID Type *</label>
                    <div className="relative">
                      <select required value={idForm.id_type} onChange={e => setIdForm({...idForm, id_type: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white">
                        <option value="Aadhaar">Aadhaar</option>
                        <option value="PAN">PAN</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Passport">Passport</option>
                        <option value="National ID">National ID</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Front Image *</label>
                      <div
                        className={`mt-1 flex justify-center px-4 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 ${getDropZoneClass('idFront')}`}
                        {...makeDragHandlers('idFront', (files) => setIdFrontFile(files[0]))}
                      >
                        <div className="space-y-1 text-center">
                          <ImageIcon className={`mx-auto h-8 w-8 transition-colors ${dragStates.idFront ? 'text-primary' : 'text-gray-400'}`} />
                          {dragStates.idFront ? (
                            <p className="text-xs text-primary font-semibold">Drop front image here!</p>
                          ) : (
                            <div className="flex text-xs text-gray-600 justify-center">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                                <span>Upload front</span>
                                <input type="file" required className="sr-only" onChange={e => setIdFrontFile(e.target.files[0])} accept="image/*" />
                              </label>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">
                            {idFrontFile ? idFrontFile.name : "PNG, JPG up to 10MB"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Back Image *</label>
                      <div
                        className={`mt-1 flex justify-center px-4 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 ${getDropZoneClass('idBack')}`}
                        {...makeDragHandlers('idBack', (files) => setIdBackFile(files[0]))}
                      >
                        <div className="space-y-1 text-center">
                          <ImageIcon className={`mx-auto h-8 w-8 transition-colors ${dragStates.idBack ? 'text-primary' : 'text-gray-400'}`} />
                          {dragStates.idBack ? (
                            <p className="text-xs text-primary font-semibold">Drop back image here!</p>
                          ) : (
                            <div className="flex text-xs text-gray-600 justify-center">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                                <span>Upload back</span>
                                <input type="file" required className="sr-only" onChange={e => setIdBackFile(e.target.files[0])} accept="image/*" />
                              </label>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">
                            {idBackFile ? idBackFile.name : "PNG, JPG up to 10MB"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {fd?.government_id && (
                     <div className="mt-4">
                       <h4 className="text-sm font-medium text-gray-700 mb-2">Current ID:</h4>
                       <div className="text-sm flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                         <ShieldCheck className="w-4 h-4 text-indigo-500" />
                         {fd.government_id.id_type} ({fd.government_id.status || "Pending"})
                       </div>
                     </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => { setActiveModal(null); setIdFrontFile(null); setIdBackFile(null); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload & Save'}
                  </button>
                </div>
              </form>
            ) : activeModal === 'images' ? (
              <form onSubmit={handleImagesSubmit} className="space-y-4">
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Upload Farm Images *</label>
                    <div
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-200 bg-gray-50 ${getDropZoneClass('images')}`}
                      {...makeDragHandlers('images', (files) => setImageFiles(prev => [...prev, ...files]))}
                    >
                      <div className="space-y-1 text-center">
                        <ImageIcon className={`mx-auto h-12 w-12 transition-colors ${dragStates.images ? 'text-primary' : 'text-gray-400'}`} />
                        {dragStates.images ? (
                          <p className="text-sm text-primary font-semibold">Drop your images here!</p>
                        ) : (
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                              <span>Upload images</span>
                              <input type="file" multiple required className="sr-only" onChange={e => setImageFiles(Array.from(e.target.files))} accept="image/*" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : "PNG, JPG up to 10MB each"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {fd?.farm_images?.length > 0 && (
                     <div className="mt-4">
                       <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Uploaded Images:</h4>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {fd.farm_images.map((url, idx) => (
                           <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                             <img src={`${BASE_URL}${url}`} alt={`Farm image ${idx+1}`} className="object-cover w-full h-full" />
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => { setActiveModal(null); setImageFiles([]); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload & Save'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="py-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Form implementation for {activeModal} goes here.</p>
                  <p className="text-sm mt-2">Connects to backend APIs to update progress.</p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      toast.success(`${activeModal} saved`);
                      setActiveModal(null);
                    }}
                    className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
