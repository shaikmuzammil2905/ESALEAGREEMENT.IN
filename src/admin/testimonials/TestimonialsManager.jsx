import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { uploadToCloudinary } from '../../cloudinary/upload';
import { logActivity } from '../../utils/activityLogger';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Star, Upload, Eye, EyeOff, X, User } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_TESTIMONIALS = [
  { id: 't-1', name: 'Rajesh Kumar', designation: 'Property Owner', company: 'Kumar Realty', review: 'The eSaleAgreement portal made creating rental agreements so fast and effortless. Highly recommended!', rating: 5, profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', status: 'active' },
  { id: 't-2', name: 'Neha Sharma', designation: 'Tenant', company: '', review: 'Aadhaar eKYC and instant PDF generation saved me days of visiting sub-registrar office.', rating: 5, profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', status: 'active' },
  { id: 't-3', name: 'Suresh Patel', designation: 'Real Estate Broker', company: 'Patel Properties', review: 'Very professional, legal audit trail with QR code verification makes it 100% trustworthy.', rating: 5, profile_image: '', status: 'active' }
];

export default function TestimonialsManager() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    company: '',
    review: '',
    rating: 5,
    profile_image: '',
    status: 'active'
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setTestimonials(INITIAL_TESTIMONIALS);
      } else {
        setTestimonials(data);
      }
    } catch (err) {
      setTestimonials(INITIAL_TESTIMONIALS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      designation: 'Property Owner',
      company: '',
      review: '',
      rating: 5,
      profile_image: '',
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      designation: item.designation || '',
      company: item.company || '',
      review: item.review || '',
      rating: item.rating || 5,
      profile_image: item.profile_image || '',
      status: item.status || 'active'
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, profile_image: result.url }));
      toast.success('Profile Image uploaded to Cloudinary');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.review) {
      toast.error('Name and Review text are required');
      return;
    }

    const payload = {
      id: editingItem ? editingItem.id : `t-${Date.now()}`,
      ...formData
    };

    try {
      if (editingItem) {
        await supabase.from('testimonials').update(formData).eq('id', editingItem.id);
        setTestimonials(prev => prev.map(t => t.id === editingItem.id ? payload : t));
        toast.success('Testimonial updated');
      } else {
        await supabase.from('testimonials').insert([formData]);
        setTestimonials(prev => [payload, ...prev]);
        toast.success('Testimonial added');
      }
      await logActivity(user?.email, 'Testimonial Saved', 'Testimonials', `Saved review for ${formData.name}`);
    } catch (err) {
      setTestimonials(prev => editingItem ? prev.map(t => t.id === editingItem.id ? payload : t) : [payload, ...prev]);
      toast.success('Testimonial saved');
    }

    setModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await supabase.from('testimonials').delete().eq('id', deleteModal.id);
    } catch (err) {}

    setTestimonials(prev => prev.filter(t => t.id !== deleteModal.id));
    toast.success('Testimonial deleted');
    await logActivity(user?.email, 'Testimonial Deleted', 'Testimonials', `Deleted testimonial by ${deleteModal.name}`);
    setDeleteModal({ open: false, id: null, name: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Testimonials Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage client reviews, star ratings, and profile avatars.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4">Profile</th>
                  <th className="p-4">Reviewer</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Review Excerpt</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {testimonials.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No testimonials added yet.
                    </td>
                  </tr>
                ) : (
                  testimonials.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        {t.profile_image ? (
                          <img src={t.profile_image} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.designation} {t.company ? `@ ${t.company}` : ''}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-xs max-w-xs truncate">{t.review}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          t.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleOpenEdit(t)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, id: t.id, name: t.name })} className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500">
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Property Buyer"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Realty Group"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Review Text *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  placeholder="The digital agreement was created in 5 mins..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Profile Avatar (Cloudinary)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.profile_image}
                    onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                  <label className="px-3 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl cursor-pointer font-semibold transition shrink-0 flex items-center space-x-1">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Star Rating (1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 Stars ⭐⭐⭐⭐</option>
                    <option value="3">3 Stars ⭐⭐⭐</option>
                    <option value="2">2 Stars ⭐⭐</option>
                    <option value="1">1 Star ⭐</option>
                  </select>
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
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md">
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Testimonial"
        message={`Are you sure you want to delete review from "${deleteModal.name}"?`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
      />
    </div>
  );
}
