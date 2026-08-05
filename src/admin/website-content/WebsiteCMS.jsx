import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { uploadToCloudinary } from '../../cloudinary/upload';
import { logActivity } from '../../utils/activityLogger';
import { useAuth } from '../../context/AuthContext';
import { Globe, Home, Info, PhoneCall, Layout, Search as SearchIcon, Upload, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebsiteCMS() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [cmsData, setCmsData] = useState({
    hero: {
      title: 'Secure Every Sale Digitally',
      subtitle: 'Create secure digital sale agreements in minutes with Aadhaar eKYC, OTP Verification, eSign, QR Verification, Secure Cloud Storage, and Verifiable Audit Trails.',
      badge: "India's Trusted Digital Agreement Platform",
      ctaText: 'Get Started',
      ctaLink: 'contact.html',
      heroImage: ''
    },
    about: {
      title: 'About eSaleAgreement',
      description: 'We simplify real estate legal documentation with bank-grade encryption, instant Aadhaar verification, and legal compliance.',
      mission: 'To make property agreements instant, transparent, and legally tamper-proof across India.',
      vision: 'To become India\'s premier digital real estate documentation ecosystem.'
    },
    contact: {
      phone: '+91 98765 43210',
      email: 'support@esaleagreement.in',
      address: 'Level 4, Legal Tech Park, Hyderabad, India',
      hours: 'Mon - Sat: 9:00 AM - 7:00 PM'
    },
    footer: {
      footerText: 'eSaleAgreement is India\'s premier digital property agreement platform powered by Aadhaar eKYC.',
      copyright: '© 2026 eSaleAgreement. All rights reserved.'
    },
    seo: {
      metaTitle: 'eSaleAgreement - Secure Every Sale Digitally',
      metaDescription: 'Create secure digital sale agreements in minutes with Aadhaar eKYC, OTP Verification, eSign, QR Verification, and Secure Cloud Storage.',
      keywords: 'digital sale agreement, rent agreement online, eSign agreement India, Aadhaar eKYC real estate',
      ogImage: '',
      favicon: 'assets/logo.png'
    }
  });

  useEffect(() => {
    fetchCMSContent();
  }, []);

  const fetchCMSContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('website_content').select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        const merged = { ...cmsData };
        data.forEach(item => {
          if (item.section_key && item.content_json) {
            merged[item.section_key] = item.content_json;
          }
        });
        setCmsData(merged);
      }
    } catch (err) {
      console.error('Error fetching CMS content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (sectionKey) => {
    setSaving(true);
    try {
      const contentPayload = cmsData[sectionKey];
      const { error } = await supabase.from('website_content').upsert({
        section_key: sectionKey,
        content_json: contentPayload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section_key' });

      if (error) throw error;
      toast.success(`${sectionKey.toUpperCase()} section saved successfully`);
      await logActivity(user?.email, 'CMS Content Updated', 'Website Content', `Updated section: ${sectionKey}`);
    } catch (err) {
      toast.error('Failed to save CMS section');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, sectionKey, fieldKey) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file);
      setCmsData(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [fieldKey]: result.url
        }
      }));
      toast.success('Media uploaded to Cloudinary');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const tabs = [
    { id: 'hero', name: 'Home Hero', icon: Home },
    { id: 'about', name: 'About Section', icon: Info },
    { id: 'contact', name: 'Contact Details', icon: PhoneCall },
    { id: 'footer', name: 'Footer Text', icon: Layout },
    { id: 'seo', name: 'SEO & Metadata', icon: SearchIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Website CMS Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Dynamically update public website text, titles, contact details, and SEO metadata.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center space-x-2 shrink-0 ${
                activeTab === t.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Section Editors */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl space-y-6">
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Home Hero Settings</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Badge Text</label>
              <input
                type="text"
                value={cmsData.hero.badge || ''}
                onChange={(e) => setCmsData({ ...cmsData, hero: { ...cmsData.hero, badge: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Hero Main Title</label>
              <input
                type="text"
                value={cmsData.hero.title || ''}
                onChange={(e) => setCmsData({ ...cmsData, hero: { ...cmsData.hero, title: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Hero Subtitle / Description</label>
              <textarea
                rows="3"
                value={cmsData.hero.subtitle || ''}
                onChange={(e) => setCmsData({ ...cmsData, hero: { ...cmsData.hero, subtitle: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Button Text</label>
                <input
                  type="text"
                  value={cmsData.hero.ctaText || ''}
                  onChange={(e) => setCmsData({ ...cmsData, hero: { ...cmsData.hero, ctaText: e.target.value } })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Button Link</label>
                <input
                  type="text"
                  value={cmsData.hero.ctaLink || ''}
                  onChange={(e) => setCmsData({ ...cmsData, hero: { ...cmsData.hero, ctaLink: e.target.value } })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={() => handleSaveSection('hero')}
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Hero Section</span>
            </button>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">About Us Section</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Section Title</label>
              <input
                type="text"
                value={cmsData.about.title || ''}
                onChange={(e) => setCmsData({ ...cmsData, about: { ...cmsData.about, title: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">About Description</label>
              <textarea
                rows="4"
                value={cmsData.about.description || ''}
                onChange={(e) => setCmsData({ ...cmsData, about: { ...cmsData.about, description: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Mission Statement</label>
                <textarea
                  rows="3"
                  value={cmsData.about.mission || ''}
                  onChange={(e) => setCmsData({ ...cmsData, about: { ...cmsData.about, mission: e.target.value } })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Vision Statement</label>
                <textarea
                  rows="3"
                  value={cmsData.about.vision || ''}
                  onChange={(e) => setCmsData({ ...cmsData, about: { ...cmsData.about, vision: e.target.value } })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={() => handleSaveSection('about')}
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save About Section</span>
            </button>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Contact Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={cmsData.contact.phone || ''}
                  onChange={(e) => setCmsData({ ...cmsData, contact: { ...cmsData.contact, phone: e.target.value } })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Support Email</label>
                <input
                  type="email"
                  value={cmsData.contact.email || ''}
                  onChange={(e) => setCmsData({ ...cmsData, contact: { ...cmsData.contact, email: e.target.value } })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Office Address</label>
              <textarea
                rows="2"
                value={cmsData.contact.address || ''}
                onChange={(e) => setCmsData({ ...cmsData, contact: { ...cmsData.contact, address: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Business Hours</label>
              <input
                type="text"
                value={cmsData.contact.hours || ''}
                onChange={(e) => setCmsData({ ...cmsData, contact: { ...cmsData.contact, hours: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => handleSaveSection('contact')}
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Contact Details</span>
            </button>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Footer Settings</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Footer About Text</label>
              <textarea
                rows="3"
                value={cmsData.footer.footerText || ''}
                onChange={(e) => setCmsData({ ...cmsData, footer: { ...cmsData.footer, footerText: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Copyright Text</label>
              <input
                type="text"
                value={cmsData.footer.copyright || ''}
                onChange={(e) => setCmsData({ ...cmsData, footer: { ...cmsData.footer, copyright: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => handleSaveSection('footer')}
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Footer Section</span>
            </button>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">SEO & OpenGraph Meta</h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Meta Title</label>
              <input
                type="text"
                value={cmsData.seo.metaTitle || ''}
                onChange={(e) => setCmsData({ ...cmsData, seo: { ...cmsData.seo, metaTitle: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Meta Description</label>
              <textarea
                rows="3"
                value={cmsData.seo.metaDescription || ''}
                onChange={(e) => setCmsData({ ...cmsData, seo: { ...cmsData.seo, metaDescription: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">SEO Keywords (Comma separated)</label>
              <input
                type="text"
                value={cmsData.seo.keywords || ''}
                onChange={(e) => setCmsData({ ...cmsData, seo: { ...cmsData.seo, keywords: e.target.value } })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">OpenGraph OG Image URL (Cloudinary)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={cmsData.seo.ogImage || ''}
                  onChange={(e) => setCmsData({ ...cmsData, seo: { ...cmsData.seo, ogImage: e.target.value } })}
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <label className="px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl cursor-pointer font-semibold transition shrink-0 flex items-center space-x-1">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'seo', 'ogImage')} className="hidden" />
                </label>
              </div>
            </div>

            <button
              onClick={() => handleSaveSection('seo')}
              disabled={saving}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save SEO Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
