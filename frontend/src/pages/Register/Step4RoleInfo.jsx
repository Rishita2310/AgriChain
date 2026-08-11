import React from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { useForm } from 'react-hook-form';

export default function Step4RoleInfo() {
  const { formData, updateFarmerDetails, updateBuyerDetails, nextStep, prevStep } = useRegisterStore();
  const isFarmer = formData.role === 'Farmer';

  const { register, handleSubmit } = useForm({
    defaultValues: isFarmer ? formData.farmer_details : formData.buyer_details
  });

  const onSubmit = (data) => {
    if (isFarmer) {
      // Clean up multiple selects if needed
      updateFarmerDetails(data);
    } else {
      updateBuyerDetails(data);
    }
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{isFarmer ? 'Farm Details' : 'Business Details'}</h2>
        <p className="text-gray-500">Provide specific information for your {isFarmer ? 'farm' : 'business'}.</p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2 pb-4">
        {isFarmer ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
              <input {...register("farm_name", { required: true })} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address *</label>
              <textarea {...register("farm_address", { required: true })} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary" required></textarea>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (Acres)</label>
                <input {...register("farm_size", { valueAsNumber: true })} type="number" min="0" step="0.1" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select {...register("experience")} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary bg-white">
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5-10 Years">5-10 Years</option>
                  <option value="10+ Years">10+ Years</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input {...register("business_name", { required: true })} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <select {...register("business_type")} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary bg-white">
                <option value="Retailer">Retailer</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Distributor">Distributor</option>
                <option value="Exporter">Exporter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
              <textarea {...register("delivery_address", { required: true })} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary" required></textarea>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                <input {...register("gst_number")} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
                <input {...register("website")} type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-between pt-6 border-t border-gray-100 bg-white">
        <button type="button" onClick={prevStep} className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors">Back</button>
        <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all">Continue</button>
      </div>
    </form>
  );
}