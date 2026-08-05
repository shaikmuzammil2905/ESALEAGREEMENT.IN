import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { logActivity } from '../../utils/activityLogger';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, CreditCard, Check, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_PLANS = [
  { id: 'p-1', plan_name: 'Basic Agreement', price: '₹499', duration: 'per document', features: ['1 Agreement Draft', 'Aadhaar OTP eKYC', 'Standard Stamp Duty', 'Instant PDF Download'], highlighted_plan: false, display_order: 1, status: 'active' },
  { id: 'p-2', plan_name: 'Pro eSign Plan', price: '₹999', duration: 'per document', features: ['Instant Digital eSign', 'Priority Legal Review', 'Custom Clause Editor', 'QR Code Verification', 'Cloud Backup (5 Yrs)'], highlighted_plan: true, display_order: 2, status: 'active' },
  { id: 'p-3', plan_name: 'Enterprise Bulk', price: '₹2,499', duration: '10 agreements', features: ['Dedicated Account Manager', 'Bulk Aadhaar eKYC', 'API Integration Access', '24/7 Priority Legal Support'], highlighted_plan: false, display_order: 3, status: 'active' }
];

export default function PricingManager() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    plan_name: '',
    price: '₹499',
    duration: 'per agreement',
    features: '',
    highlighted_plan: false,
    button_text: 'Choose Plan',
    button_link: 'contact.html',
    display_order: 1,
    status: 'active'
  });

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        setPlans(INITIAL_PLANS);
      } else {
        setPlans(data);
      }
    } catch (err) {
      setPlans(INITIAL_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      plan_name: '',
      price: '₹499',
      duration: 'per agreement',
      features: '',
      highlighted_plan: false,
      button_text: 'Choose Plan',
      button_link: 'contact.html',
      display_order: plans.length + 1,
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingItem(plan);
    setFormData({
      plan_name: plan.plan_name || '',
      price: plan.price || '₹499',
      duration: plan.duration || 'per agreement',
      features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
      highlighted_plan: plan.highlighted_plan || false,
      button_text: plan.button_text || 'Choose Plan',
      button_link: plan.button_link || 'contact.html',
      display_order: plan.display_order || 1,
      status: plan.status || 'active'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plan_name || !formData.price) {
      toast.error('Plan Name and Price are required');
      return;
    }

    const payload = {
      id: editingItem ? editingItem.id : `p-${Date.now()}`,
      ...formData,
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      display_order: parseInt(formData.display_order, 10) || 1
    };

    try {
      if (editingItem) {
        await supabase.from('pricing_plans').update(payload).eq('id', editingItem.id);
        setPlans(prev => prev.map(p => p.id === editingItem.id ? payload : p));
        toast.success('Pricing plan updated');
      } else {
        await supabase.from('pricing_plans').insert([payload]);
        setPlans(prev => [...prev, payload]);
        toast.success('Pricing plan created');
      }
      await logActivity(user?.email, 'Pricing Saved', 'Pricing', `Saved plan: ${formData.plan_name}`);
    } catch (err) {
      setPlans(prev => editingItem ? prev.map(p => p.id === editingItem.id ? payload : p) : [...prev, payload]);
      toast.success('Pricing plan saved');
    }

    setModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await supabase.from('pricing_plans').delete().eq('id', deleteModal.id);
    } catch (err) {}

    setPlans(prev => prev.filter(p => p.id !== deleteModal.id));
    toast.success('Pricing plan deleted');
    await logActivity(user?.email, 'Pricing Plan Deleted', 'Pricing', `Deleted plan: ${deleteModal.name}`);
    setDeleteModal({ open: false, id: null, name: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Plans Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure pricing tiers, features, and highlighted packages.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pricing Plan</span>
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border ${
                plan.highlighted_plan
                  ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              } flex flex-col justify-between relative`}
            >
              {plan.highlighted_plan && (
                <div className="absolute -top-3 right-6 px-3 py-1 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase rounded-full tracking-wider flex items-center space-x-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  <span>Popular Plan</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.plan_name}</h3>
                  <span className="text-xs text-slate-400 font-semibold">#{plan.display_order}</span>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">/ {plan.duration}</span>
                </div>

                <ul className="space-y-2 pt-2 text-xs">
                  {plan.features?.map((feat, i) => (
                    <li key={i} className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-6">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                  plan.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {plan.status}
                </span>

                <div className="flex items-center space-x-2">
                  <button onClick={() => handleOpenEdit(plan)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteModal({ open: true, id: plan.id, name: plan.plan_name })} className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Pricing Plan' : 'Add Pricing Plan'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.plan_name}
                    onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                    placeholder="e.g. Pro eSign Plan"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Price *</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. ₹999"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Features (Comma separated)</label>
                <textarea
                  rows="3"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Instant Digital eSign, Aadhaar OTP, Stamp Paper, PDF Download"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={formData.highlighted_plan}
                  onChange={(e) => setFormData({ ...formData, highlighted_plan: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded accent-emerald-500"
                />
                <label htmlFor="highlight" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                  Mark as Highlighted / Most Popular Plan
                </label>
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
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md">
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Pricing Plan"
        message={`Are you sure you want to delete pricing plan: "${deleteModal.name}"?`}
        confirmText="Delete Plan"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
      />
    </div>
  );
}
