import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { uploadToCloudinary } from '../../cloudinary/upload';
import { logActivity } from '../../utils/activityLogger';
import { useAuth } from '../../context/AuthContext';
import { Building2, Share2, Mail, Save, Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [companySettings, setCompanySettings] = useState({
    companyName: 'eSaleAgreement India Private Limited',
    logoUrl: 'assets/logo.png',
    email: 'support@esaleagreement.in',
    phone: '+91 98765 43210',
    address: 'Level 4, Legal Tech Park, Financial District, Hyderabad 500032',
    gstin: '36AAACE1234F1Z9'
  });

  const [socialSettings, setSocialSettings] = useState({
    facebook: 'https://facebook.com/esaleagreement',
    instagram: 'https://instagram.com/esaleagreement',
    linkedin: 'https://linkedin.com/company/esaleagreement',
    twitter: 'https://twitter.com/esaleagreement',
    youtube: 'https://youtube.com/@esaleagreement',
    whatsapp: 'https://wa.me/919876543210'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpEmail: 'notifications@esaleagreement.in',
    smtpPassword: '••••••••••••••••'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        const cSettings = { ...companySettings };
        const sSettings = { ...socialSettings };
        const eSettings = { ...emailSettings };

        data.forEach(item => {
          if (item.category === 'company') cSettings[item.key] = item.value;
          if (item.category === 'social') sSettings[item.key] = item.value;
          if (item.category === 'email') eSettings[item.key] = item.value;
        });

        setCompanySettings(cSettings);
        setSocialSettings(sSettings);
        setEmailSettings(eSettings);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const handleSaveCategory = async (category, dataObj) => {
    setSaving(true);
    try {
      const rows = Object.entries(dataObj).map(([key, value]) => ({
        category,
        key,
        value: String(value),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'category,key' });
      if (error) throw error;
      toast.success(`${category.toUpperCase()} settings saved successfully`);
      await logActivity(user?.email, 'Settings Saved', 'Settings', `Saved ${category} configuration`);
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const result = await uploadToCloudinary(file);
      setCompanySettings(prev => ({ ...prev, logoUrl: result.url }));
      toast.success('Logo uploaded to Cloudinary');
    } catch (err) {
      toast.error('Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Platform Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure company identity, social media channels, and SMTP parameters.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
            activeTab === 'company' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Profile & Logo</span>
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
            activeTab === 'social' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Social Media Links</span>
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
            activeTab === 'email' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email & SMTP Config</span>
        </button>
      </div>

      {/* Content Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl space-y-6">
        {activeTab === 'company' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory('company', companySettings); }} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Company Legal Name</label>
              <input
                type="text"
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Company Logo (Cloudinary)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={companySettings.logoUrl}
                  onChange={(e) => setCompanySettings({ ...companySettings, logoUrl: e.target.value })}
                  className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <label className="px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl cursor-pointer font-semibold transition shrink-0 flex items-center space-x-1">
                  <Upload className="w-4 h-4" />
                  <span>Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Company Phone</label>
                <input
                  type="text"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">GSTIN Details</label>
                <input
                  type="text"
                  value={companySettings.gstin}
                  onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Registered Address</label>
              <textarea
                rows="3"
                value={companySettings.address}
                onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button type="submit" disabled={saving} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Company Settings</span>
            </button>
          </form>
        )}

        {activeTab === 'social' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory('social', socialSettings); }} className="space-y-4 text-sm">
            {Object.keys(socialSettings).map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 capitalize">{key} URL</label>
                <input
                  type="text"
                  value={socialSettings[key]}
                  onChange={(e) => setSocialSettings({ ...socialSettings, [key]: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            ))}

            <button type="submit" disabled={saving} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Social Media Settings</span>
            </button>
          </form>
        )}

        {activeTab === 'email' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory('email', emailSettings); }} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">SMTP Port</label>
                <input
                  type="text"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Sender Email</label>
              <input
                type="email"
                value={emailSettings.smtpEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpEmail: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">SMTP Password</label>
              <input
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button type="submit" disabled={saving} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Email Settings</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
