import React, { useState } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';

export default function AddressSelection({ selectedAddress, onSelectAddress }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      full_name: 'axae patel',
      phone_number: '+91 98765 43210',
      address_line1: 'B-204, Green Valley Apartments',
      address_line2: 'Sector 45',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pin_code: '380015',
      address_type: 'Home'
    }
  ]);

  const handleAddNew = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAddr = {
      id: Date.now(),
      full_name: formData.get('full_name'),
      phone_number: formData.get('phone_number'),
      address_line1: formData.get('address_line1'),
      address_line2: formData.get('address_line2'),
      city: formData.get('city'),
      state: formData.get('state'),
      country: formData.get('country'),
      pin_code: formData.get('pin_code'),
      address_type: formData.get('address_type'),
    };
    setAddresses([...addresses, newAddr]);
    onSelectAddress(newAddr);
    setShowAddForm(false);
  };

  // Auto-select first address if none selected
  React.useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      onSelectAddress(addresses[0]);
    }
  }, [addresses, selectedAddress, onSelectAddress]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="text-green-600 font-semibold text-sm flex items-center gap-1 hover:text-green-700"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showAddForm ? (
        <form onSubmit={handleAddNew} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required name="full_name" type="text" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input required name="phone_number" type="tel" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
              <input required name="address_line1" type="text" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <input name="address_line2" type="text" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input required name="city" type="text" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input required name="state" type="text" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
              <input required name="pin_code" type="text" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input required name="country" type="text" defaultValue="India" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
              <select name="address_type" className="w-full rounded-lg border-gray-300 p-2.5 border focus:ring-green-500 focus:border-green-500 outline-none bg-white">
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Farm">Farm</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">Save Address</button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div 
              key={addr.id}
              onClick={() => onSelectAddress(addr)}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-green-500 bg-green-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
            >
              {selectedAddress?.id === addr.id && (
                <div className="absolute top-4 right-4 bg-green-500 text-white p-1 rounded-full shadow-sm">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                  {addr.address_type}
                </span>
                <span className="font-bold text-gray-900">{addr.full_name}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-2">
                {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                {addr.city}, {addr.state} - {addr.pin_code}
              </p>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                📞 {addr.phone_number}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
