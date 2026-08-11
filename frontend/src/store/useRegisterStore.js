import { create } from 'zustand';

export const useRegisterStore = create((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 6) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  
  formData: {
    role: '',
    wallet_address: '',
    full_name: '',
    email: '',
    phone_number: '',
    country: '',
    state: '',
    city: '',
    preferred_language: 'en',
    profile_photo: null,
    farmer_details: {
      farm_name: '',
      farm_address: '',
      farm_size: 0,
      experience: 'Less than 1 year',
      organic_farming: false,
      primary_crops: [],
      notes: ''
    },
    buyer_details: {
      business_name: '',
      business_type: 'Retailer',
      delivery_address: '',
      gst_number: '',
      registration_number: '',
      website: ''
    }
  },
  
  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  
  updateFarmerDetails: (data) => set((state) => ({
    formData: { 
      ...state.formData, 
      farmer_details: { ...state.formData.farmer_details, ...data } 
    }
  })),
  
  updateBuyerDetails: (data) => set((state) => ({
    formData: { 
      ...state.formData, 
      buyer_details: { ...state.formData.buyer_details, ...data } 
    }
  })),
}));