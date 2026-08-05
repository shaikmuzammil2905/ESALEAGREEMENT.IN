import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { logActivity } from '../../utils/activityLogger';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import {
  Plus, Edit, Trash2, Eye, EyeOff, X, Save,
  ArrowUp, ArrowDown, Navigation, Globe, Link,
  Home, Layers, HelpCircle, CreditCard, FileText,
  BookOpen, DollarSign, Phone, Star, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_ICONS = {
  'Home': Home,
  'Features': Layers,
  'Why Choose Us': Star,
  'How It Works': BookOpen,
  'Pricing': CreditCard,
  'FAQs': HelpCircle,
  'Legal Assistance': FileText,
  'Loans': DollarSign,
  'Contact': Phone,
};

const DEFAULT_NAV_ITEMS = [
  { id: 'nav-1', label: 'Home', href: 'index.html', display_order: 1, visible: true, is_cta: false, target: '_self' },
  { id: 'nav-2', label: 'Features', href: 'features.html', display_order: 2, visible: true, is_cta: false, target: '_self' },
  { id: 'nav-3', label: 'Why Choose Us', href: 'why-choose-us.html', display_order: 3, visible: true, is_cta: false, target: '_self' },
  { id: 'nav-4', label: 'How It Works', href: 'how-it-works.html', display_order: 4, visible: true, is_cta: false, target: '_self' },
  { id: 'nav-5', label: 'Pricing', href: 'pricing.html', display_order: 5, visible: true, is_cta: false, target: '_self' },
  { id: 'nav-6', label: 'FAQs', href: 'faq.html', display_order: 6, visible: true, is_cta: false, target: '_self' },
  { id: 'nav-7', label: 'Legal Assistance', href: 'legal-assistance.html', display_order: 7, visible: true, is_cta: false, target: '_self' },
  { id: 'nav-8', label: 'Loans', href: 'loans.html', display_order: 8, visible: true, is_cta: false, target: '_self' },
  { id: 'nav-9', label: 'Contact', href: 'contact.html', display_order: 9, visible: true, is_cta: true, target: '_self' },
];

const EMPTY_FORM = {
  label: '',
  href: '',
  display_order: 10,
  visible: true,
  is_cta: false,
  target: '_self'
};

export default function NavigationManager() {
  const { user } = useAuth();
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, label: '' });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchNavItems(); }, []);

  const fetchNavItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) {
        setNavItems(DEFAULT_NAV_ITEMS);
      } else {
        setNavItems(data);
      }
    } catch {
      setNavItems(DEFAULT_NAV_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ ...EMPTY_FORM, display_order: navItems.length + 1 });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      label: item.label || '',
      href: item.href || '',
      display_order: item.display_order || 1,
      visible: item.visible !== false,
      is_cta: item.is_cta || false,
      target: item.target || '_self'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label.trim() || !formData.href.trim()) {
      toast.error('Label and URL are required');
      return;
    }
    setSaving(true);
    const payload = {
      id: editingItem ? editingItem.id : `nav-${Date.now()}`,
      ...formData,
      display_order: parseInt(formData.display_order, 10) || 1
    };
    try {
      if (editingItem) {
        await supabase.from('nav_items').update(payload).eq('id', editingItem.id);
        setNavItems(prev => prev.map(n => n.id === editingItem.id ? payload : n).sort((a, b) => a.display_order - b.display_order));
        toast.success('Navigation item updated');
      } else {
        await supabase.from('nav_items').insert([payload]);
        setNavItems(prev => [...prev, payload].sort((a, b) => a.display_order - b.display_order));
        toast.success('Navigation item added');
      }
      await logActivity(user?.email, editingItem ? 'Nav Item Updated' : 'Nav Item Added', 'Navigation', `${formData.label} -> ${formData.href}`);
    } catch {
      setNavItems(prev =>
        editingItem
          ? prev.map(n => n.id === editingItem.id ? payload : n).sort((a, b) => a.display_order - b.display_order)
          : [...prev, payload].sort((a, b) => a.display_order - b.display_order)
      );
      toast.success('Navigation item saved (offline)');
    } finally {
      setSaving(false);
      setModalOpen(false);
    }
  };

  const handleToggleVisible = async (item) => {
    const updated = { ...item, visible: !item.visible };
    try {
      await supabase.from('nav_items').update({ visible: updated.visible }).eq('id', item.id);
    } catch {}
    setNavItems(prev => prev.map(n => n.id === item.id ? updated : n));
    toast.success(`"${item.label}" is now ${updated.visible ? 'visible' : 'hidden'}`);
    await logActivity(user?.email, 'Nav Visibility Changed', 'Navigation', `${item.label} -> ${updated.visible ? 'visible' : 'hidden'}`);
  };

  const swapOrder = async (a, b) => {
    const newItems = navItems.map(n => {
      if (n.id === a.id) return { ...n, display_order: b.display_order };
      if (n.id === b.id) return { ...n, display_order: a.display_order };
      return n;
    }).sort((x, y) => x.display_order - y.display_order);
    setNavItems(newItems);
    try {
      await supabase.from('nav_items').update({ display_order: b.display_order }).eq('id', a.id);
      await supabase.from('nav_items').update({ display_order: a.display_order }).eq('id', b.id);
    } catch {}
    toast.success('Order updated');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await supabase.from('nav_items').delete().eq('id', deleteModal.id);
    } catch {}
    setNavItems(prev => prev.filter(n => n.id !== deleteModal.id));
    toast.success(`"${deleteModal.label}" removed from navigation`);
    await logActivity(user?.email, 'Nav Item Deleted', 'Navigation', `Deleted: ${deleteModal.label}`);
    setDeleteModal({ open: false, id: null, label: '' });
  };

  const sortedItems = [...navItems].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-indigo-500" />
            <span>Navigation Manager</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Add, edit, reorder or hide navigation menu pages. Changes sync to Supabase.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Nav Item</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start space-x-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 text-sm">
        <Globe className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-indigo-700 dark:text-indigo-300">
          <span className="font-bold">9 navigation pages are managed here:</span> Home, Features, Why Choose Us, How It Works, Pricing, FAQs, Legal Assistance, Loans, Contact.
          Use the <Eye className="w-3.5 h-3.5 inline" /> toggle to show/hide, ↑↓ to reorder, and <Edit className="w-3.5 h-3.5 inline" /> to change labels or URLs.
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Page Name</th>
                  <th className="p-4">URL / Path</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-center">Visibility</th>
                  <th className="p-4 text-center">Reorder</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-400">
                      No navigation items. Click "Add Nav Item" to get started.
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item, idx) => {
                    const IconComp = PAGE_ICONS[item.label] || Globe;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${!item.visible ? 'opacity-40' : ''}`}
                      >
                        <td className="p-4">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                            {item.display_order}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                              {item.is_cta && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-full font-bold">
                                  CTA Button
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Link className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-mono truncate max-w-[180px]">{item.href}</span>
                            {item.target === '_blank' && (
                              <span className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold shrink-0">EXT</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.is_cta
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {item.is_cta ? 'Button' : 'Link'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleVisible(item)}
                            title={item.visible ? 'Visible — click to hide' : 'Hidden — click to show'}
                            className={`p-2 rounded-xl transition mx-auto flex items-center justify-center ${
                              item.visible
                                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500'
                            }`}
                          >
                            {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => { if (idx > 0) swapOrder(item, sortedItems[idx - 1]); }}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 disabled:opacity-20 disabled:cursor-not-allowed transition"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { if (idx < sortedItems.length - 1) swapOrder(item, sortedItems[idx + 1]); }}
                              disabled={idx === sortedItems.length - 1}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 disabled:opacity-20 disabled:cursor-not-allowed transition"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: item.id, label: item.label })}
                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Nav Preview */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Navigation Preview</p>
        <div className="flex flex-wrap gap-2 items-center">
          {sortedItems.filter(n => n.visible).map((item) => (
            <span
              key={item.id}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                item.is_cta
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-3">This preview shows visible nav items in their current order.</p>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingItem ? 'Edit Navigation Item' : 'Add Navigation Item'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure label, URL, and display options</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Menu Label *</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Home, About, Services..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Page URL / Link *</label>
                <input
                  type="text"
                  required
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  placeholder="e.g. features.html or https://..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-mono text-xs"
                />
                <p className="text-xs text-slate-400 mt-1">Use relative paths for internal pages (e.g. <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">pricing.html</code>)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Open In</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, visible: !formData.visible })}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border-2 transition select-none ${
                    formData.visible ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">Visible</p>
                    <p className="text-[10px] text-slate-400">{formData.visible ? 'Shown in nav' : 'Hidden from nav'}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${formData.visible ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    {formData.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </div>
                </div>
                <div
                  onClick={() => setFormData({ ...formData, is_cta: !formData.is_cta })}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border-2 transition select-none ${
                    formData.is_cta ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">CTA Button</p>
                    <p className="text-[10px] text-slate-400">{formData.is_cta ? 'Styled as button' : 'Plain link'}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${formData.is_cta ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-md text-sm transition flex items-center space-x-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Remove Navigation Item"
        message={`Remove "${deleteModal.label}" from the navigation menu? This hides it from the public website.`}
        confirmText="Remove Item"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, label: '' })}
      />
    </div>
  );
}
