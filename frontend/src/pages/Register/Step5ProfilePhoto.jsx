import React, { useState } from 'react';
import { useRegisterStore } from '../../store/useRegisterStore';
import { UploadCloud, X, User } from 'lucide-react';

export default function Step5ProfilePhoto() {
  const { formData, updateFormData, nextStep, prevStep } = useRegisterStore();
  const [preview, setPreview] = useState(formData.profile_photo || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        updateFormData({ profile_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    updateFormData({ profile_photo: null });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Profile Photo</h2>
        <p className="text-gray-500">Add a photo to help others recognize you (Optional).</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="relative w-40 h-40 mb-8">
          {preview ? (
            <>
              <img src={preview} alt="Profile preview" className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg" />
              <button 
                onClick={handleRemove}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="w-full h-full rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center text-gray-400">
              <User className="w-16 h-16" />
            </div>
          )}
        </div>

        <label className="bg-white border border-gray-200 hover:border-primary text-gray-700 hover:text-primary px-6 py-3 rounded-full font-medium transition-all cursor-pointer flex items-center gap-2 shadow-sm">
          <UploadCloud className="w-5 h-5" />
          {preview ? 'Replace Photo' : 'Upload Photo'}
          <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileChange} />
        </label>
        <p className="text-xs text-gray-400 mt-4">Supported formats: PNG, JPG, WEBP. Max size: 5MB.</p>
      </div>

      <div className="mt-auto flex justify-between pt-8 border-t border-gray-100">
        <button onClick={prevStep} className="text-gray-500 hover:text-gray-900 px-6 py-3 font-medium transition-colors">Back</button>
        <button onClick={nextStep} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all">
          {preview ? 'Continue' : 'Skip & Continue'}
        </button>
      </div>
    </div>
  );
}