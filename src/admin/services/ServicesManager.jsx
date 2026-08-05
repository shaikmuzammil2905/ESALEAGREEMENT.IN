import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { uploadToCloudinary } from '../../cloudinary/upload';
import { logActivity } from '../../utils/activityLogger';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_SERVICES = [
  {
    id: 'serv-1',
    title: 'Rental & Lease Agreement',
    description: 'Legally binding digital rent agreements with eSign & Aadhaar eKYC.',
    features: ['Aadhaar eKYC', 'Biometric & OTP Verification', 'Stamp Duty Collection', 'Instant PDF Download'],
    image_url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service1.jpg',
    icon_url: 'FileText',
    button_text: 'Get Started',
    button_link: 'contact.html',
    display_order: 1,
    status: 'active'
  },
  {
    id: 'serv-2',
    title: 'Commercial Property Sale Deed',
    description: 'Comprehensive digital agreements for commercial space sales & leases.',
    features: ['Title Verification', 'Custom Clauses', 'Dual Party eSign', 'Audit Trail'],
    image_url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service2.jpg',
    icon_url: 'Building',
    button_text: 'Get Started',
    button_link: 'contact.html',
    display_order: 2,
    status: 'active'
  },
  {
    id: 'serv-3',
    title: 'Residential Property Purchase',
    description: 'Draft and execute residential property purchase sale agreements digitally.',
    features: ['Instant Stamp Paper', 'QR Code Verification', 'Secure Cloud Storage', 'Legal Expert Review'],
    image_url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service3.jpg',
    icon_url: 'Home',
    button_text: 'Get Started',
    button_link: 'contact.html',
    display_order: 3,
    status: 'active'
  }
];

export default function ServicesManager() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
  const [editingService, setEditingService] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    features: '',
    image_url: '',
    icon_url: '',
    button_text: 'Get Started',
    button_link: 'contact.html',
    display_order: 1,
    status: 'active'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        setServices(INITIAL_SERVICES);
      } else {
        setServices(data);
      }
    } catch (err) {
      setServices(INITIAL_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      features: '',
      image_url: '',
      icon_url: 'FileText',
      button_text: 'Get Started',
      button_link: 'contact.html',
      display_order: services.length + 1,
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      features: Array.isArray(service.features) ? service.features.join(', ') : '',
      image_url: service.image_url || '',
      icon_url: service.icon_url || 'FileText',
      button_text: service.button_text || 'Get Started',
      button_link: service.button_link || 'contact.html',
      display_order: service.display_order || 1,
      status: service.status || 'active'
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, image_url: result.url }));
      toast.success('Service Image uploaded to Cloudinary');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Service title is required');
      return;
    }

    const payload = {
      id: editingService ? editingService.id : `serv-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      image_url: formData.image_url,
      icon_url: formData.icon_url,
      button_text: formData.button_text,
      button_link: formData.button_link,
      display_order: parseInt(formData.display_order, 10) || 1,
      status: formData.status
    };

    try {
      if (editingService) {
        await supabase.from('services').update(payload).eq('id', editingService.id);
        setServices(prev => prev.map(s => s.id === editingService.id ? payload : s));
        toast.success('Service updated successfully');
        await logActivity(user?.email, 'Service Updated', 'Services', `Updated service: ${formData.title}`);
      } else {
        await supabase.from('services').insert([payload]);
        setServices(prev => [...prev, payload]);
        toast.success('Service created successfully');
        await logActivity(user?.email, 'Service Added', 'Services', `Added new service: ${formData.title}`);
      }
    } catch (err) {
      setServices(prev => editingService ? prev.map(s => s.id === editingService.id ? payload : s) : [...prev, payload]);
      toast.success('Service saved');
    }

    setModalOpen(false);
  };

  const handleToggleStatus = async (service) => {
    const newStatus = service.status === 'active' ? 'hidden' : 'active';
    try {
      await supabase.from('services').update({ status: newStatus }).eq('id', service.id);
    } catch (err) {}

    setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: newStatus } : s));
    toast.success(`Service status changed to ${newStatus}`);
    await logActivity(user?.email, 'Service Status Changed', 'Services', `${service.title} set to ${newStatus}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await supabase.from('services').delete().eq('id', deleteModal.id);
    } catch (err) {}

    setServices(prev => prev.filter(s => s.id !== deleteModal.id));
    toast.success('Service deleted successfully');
    await logActivity(user?.email, 'Service Deleted', 'Services', `Deleted service: ${deleteModal.title}`);
    setDeleteModal({ open: false, id: null, title: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add, edit, reorder, or hide eSaleAgreement services.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4">Order</th>
                  <th className="p-4">Image</th>
                  <th className="p-4">Service Title</th>
                  <th className="p-4">Features</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No services found. Click "Add New Service" to create one.
                    </td>
                  </tr>
                ) : (
                  services.map((serv) => (
                    <tr key={serv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">#{serv.display_order}</td>
                      <td className="p-4">
                        {serv.image_url ? (
                          <img src={serv.image_url} alt={serv.title} className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{serv.title}</div>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{serv.description}</p>
                      </td>
                      <td className="p-4 text-xs">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                          {serv.features?.length || 0} Features
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(serv)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center space-x-1 ${
                            serv.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {serv.status === 'active' ? <Eye className="w-3.5 h-3.5 mr-1" /> : <EyeOff className="w-3.5 h-3.5 mr-1" />}
                          <span className="capitalize">{serv.status}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(serv)}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, id: serv.id, title: serv.title })}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 transition"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Residential Rental Agreement"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief service details..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Features (Comma separated)</label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Aadhaar eKYC, Instant PDF, Digital eSign"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Cloudinary Image Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Service Image (Cloudinary)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white text-xs"
                  />
                  <label className="px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl cursor-pointer font-semibold transition flex items-center space-x-1 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition shadow-md"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Service"
        message={`Are you sure you want to permanently delete service "${deleteModal.title}"?`}
        confirmText="Delete Service"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, title: '' })}
      />
    </div>
  );
}
