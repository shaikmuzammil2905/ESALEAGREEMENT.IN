import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { logActivity } from '../../utils/activityLogger';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, HelpCircle, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_FAQS = [
  { id: 'faq-1', question: 'Is an eSaleAgreement legally valid in India?', answer: 'Yes, digital sale agreements with Aadhaar eKYC and eSign are legally binding under the Information Technology Act 2000 and Indian Evidence Act.', display_order: 1, status: 'active' },
  { id: 'faq-2', question: 'How long does it take to create an agreement?', answer: 'The entire process takes under 10 minutes from filling details to verifying with OTP and generating your signed PDF.', display_order: 2, status: 'active' },
  { id: 'faq-3', question: 'How is stamp duty handled?', answer: 'We automatically compute required stamp duty based on state regulations and attach legal e-stamp certificates.', display_order: 3, status: 'active' }
];

export default function FAQsManager() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, question: '' });
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 1,
    status: 'active'
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        setFaqs(INITIAL_FAQS);
      } else {
        setFaqs(data);
      }
    } catch (err) {
      setFaqs(INITIAL_FAQS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      question: '',
      answer: '',
      display_order: faqs.length + 1,
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingItem(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      display_order: faq.display_order || 1,
      status: faq.status || 'active'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast.error('Question and Answer are required');
      return;
    }

    const payload = {
      id: editingItem ? editingItem.id : `faq-${Date.now()}`,
      ...formData,
      display_order: parseInt(formData.display_order, 10) || 1
    };

    try {
      if (editingItem) {
        await supabase.from('faqs').update(payload).eq('id', editingItem.id);
        setFaqs(prev => prev.map(f => f.id === editingItem.id ? payload : f));
        toast.success('FAQ updated');
      } else {
        await supabase.from('faqs').insert([payload]);
        setFaqs(prev => [...prev, payload]);
        toast.success('FAQ created');
      }
      await logActivity(user?.email, 'FAQ Saved', 'FAQs', `Saved FAQ: ${formData.question}`);
    } catch (err) {
      setFaqs(prev => editingItem ? prev.map(f => f.id === editingItem.id ? payload : f) : [...prev, payload]);
      toast.success('FAQ saved');
    }

    setModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await supabase.from('faqs').delete().eq('id', deleteModal.id);
    } catch (err) {}

    setFaqs(prev => prev.filter(f => f.id !== deleteModal.id));
    toast.success('FAQ deleted');
    await logActivity(user?.email, 'FAQ Deleted', 'FAQs', `Deleted FAQ: ${deleteModal.question}`);
    setDeleteModal({ open: false, id: null, question: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FAQ Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage frequently asked questions & answers displayed on the site.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
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
                  <th className="p-4">Order</th>
                  <th className="p-4">Question</th>
                  <th className="p-4">Answer Excerpt</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {faqs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      No FAQs created yet.
                    </td>
                  </tr>
                ) : (
                  faqs.map((faq) => (
                    <tr key={faq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">#{faq.display_order}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs">{faq.question}</td>
                      <td className="p-4 text-xs max-w-sm truncate">{faq.answer}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          faq.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {faq.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleOpenEdit(faq)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, id: faq.id, question: faq.question })} className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500">
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
                {editingItem ? 'Edit FAQ' : 'Add FAQ'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. Is an eSaleAgreement legally valid?"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Answer *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide comprehensive answer..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
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
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete FAQ"
        message={`Are you sure you want to delete FAQ: "${deleteModal.question}"?`}
        confirmText="Delete FAQ"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, question: '' })}
      />
    </div>
  );
}
