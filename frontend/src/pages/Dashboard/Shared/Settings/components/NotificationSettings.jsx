import React from 'react';

export default function NotificationSettings({ settings, setSettings }) {
  if (!settings) return null;

  const toggleNotification = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  const Toggle = ({ label, desc, isChecked, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="pr-4">
        <p className="font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isChecked ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isChecked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-2 shadow-sm">
        {children}
      </div>
    </div>
  );

  const n = settings.notifications;

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h2>
          <p className="text-gray-500 mt-1">Control which alerts you receive across the platform.</p>
        </div>
      </div>

      <Section title="Order Activity">
        <Toggle label="New Orders" desc="When a buyer places a new order" isChecked={n.new_orders} onChange={() => toggleNotification('new_orders')} />
        <Toggle label="Order Updates" desc="When orders are accepted, shipped, or delivered" isChecked={n.order_accepted} onChange={() => toggleNotification('order_accepted')} />
        <Toggle label="Payment Released" desc="When the escrow smart contract releases funds" isChecked={n.payment_released} onChange={() => toggleNotification('payment_released')} />
      </Section>

      <Section title="Marketplace">
        <Toggle label="Product Recommendations" desc="AI-curated deals based on your history" isChecked={n.new_product_recommendations} onChange={() => toggleNotification('new_product_recommendations')} />
        <Toggle label="Nearby Farmers" desc="Alerts when verified sellers join your area" isChecked={n.nearby_farmers} onChange={() => toggleNotification('nearby_farmers')} />
      </Section>

      <Section title="Security & Wallet">
        <Toggle label="Wallet Activity" desc="Blockchain transaction receipts" isChecked={n.wallet_activity} onChange={() => toggleNotification('wallet_activity')} />
        <Toggle label="Login Alerts" desc="When a new device logs into your account" isChecked={n.login_alerts} onChange={() => toggleNotification('login_alerts')} />
      </Section>

      <Section title="Delivery Methods">
        <Toggle label="Email Notifications" desc="Send daily summaries to your registered email" isChecked={n.email_notifications} onChange={() => toggleNotification('email_notifications')} />
        <Toggle label="Push Notifications" desc="Browser-level instant alerts" isChecked={n.push_notifications} onChange={() => toggleNotification('push_notifications')} />
      </Section>
    </div>
  );
}
