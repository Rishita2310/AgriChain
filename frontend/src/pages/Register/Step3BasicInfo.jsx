import React from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  full_name: z.string().min(3, "Name must be at least 3 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Invalid phone number"),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().optional(),
  preferred_language: z.string().min(1, "Language is required"),
});

export default function Step3BasicInfo() {
  const { formData, updateFormData, nextStep, prevStep } = useRegisterStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      preferred_language: formData.preferred_language,
    }
  });

  const onSubmit = (data) => {
    updateFormData(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-500">Please provide your contact details.</p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2 pb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input 
            {...register("full_name")}
            type="text" 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="John Doe"
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input 
              {...register("email")}
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input 
              {...register("phone_number")}
              type="tel" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="+1 234 567 8900"
            />
            {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input 
              {...register("country")}
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. India"
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
            <input 
              {...register("state")}
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Gujarat"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input 
              {...register("city")}
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Ahmedabad"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language *</label>
          <select 
            {...register("preferred_language")}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
          {errors.preferred_language && <p className="text-red-500 text-xs mt-1">{errors.preferred_language.message}</p>}
        </div>
      </div>

      <div className="mt-6 flex justify-between pt-6 border-t border-gray-100 bg-white relative z-10">
        <button 
          type="button"
          onClick={prevStep}
          className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors"
        >
          Back
        </button>
        <button 
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all"
        >
          Continue
        </button>
      </div>
    </form>
  );
}