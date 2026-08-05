import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { logActivity } from '../../utils/activityLogger';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Search, Download, Trash2, Mail, CheckCircle, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_REQUESTS = [
  { id: 'req-1', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', phone: '+91 98765 44332', subject: 'Bulk Enterprise Rental Agreement', message: 'Hello, we require 20+ rental agreements created monthly for our company apartments. Please share pricing.', status: 'pending', created_at: '2026-08-04T10:15:00Z' },
  { id: 'req-2', name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98123 99887', subject: 'Stamp Paper Duty Query', message: 'Can you assist with calculating Maharashtra e-stamp duty for a 3-year commercial property lease?', status: 'completed', created_at: '2026-08-03T14:30:00Z' },
  { id: 'req-3', name: 'Karan Mehta', email: 'karan.m@mehtarealty.com', phone: '+91 97654 11223', subject: 'API Integration Access', message: 'We want to integrate eSaleAgreement Aadhaar eKYC directly into our tenant onboarding website.', status: 'pending', created_at: '2026-08-01T09:00:00Z' }
];

export default function ContactRequestsManager() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setRequests(INITIAL_REQUESTS);
      } else {
        setRequests(data);
      }
    } catch (err) {
      setRequests(INITIAL_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = async (req) => {
    const newStatus = req.status === 'completed' ? 'pending' : 'completed';
    try {
      await supabase
        .from('contact_requests')
        .update({ status: newStatus })
        .eq('id', req.id);
    } catch (err) {}

    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
    toast.success(`Request marked as ${newStatus}`);
    await logActivity(user?.email, 'Contact Status Updated', 'Contact Requests', `Marked inquiry from ${req.email} as ${newStatus}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await supabase.from('contact_requests').delete().eq('id', deleteModal.id);
    } catch (err) {}

    setRequests(prev => prev.filter(r => r.id !== deleteModal.id));
    toast.success('Inquiry deleted');
    await logActivity(user?.email, 'Contact Request Deleted', 'Contact Requests', `Deleted inquiry from ${deleteModal.name}`);
    setDeleteModal({ open: false, id: null, name: '' });
  };

  const exportCSV = () => {
    if (requests.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Date'];
    const rows = filteredRequests.map(r => [
      r.id,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.phone || ''}"`,
      `"${r.subject || ''}"`,
      `"${r.message?.replace(/"/g, '""')}"`,
      r.status,
      r.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `contact_requests_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Contact inquiries exported to CSV');
  };

  const filteredRequests = requests.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.subject?.toLowerCase().includes(search.toLowerCase()) ||
    r.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Requests Inbox</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View customer messages, respond, and update resolution status.</p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2 border border-slate-700"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Inquiries CSV</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages by name, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-500 border border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4">Sender</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Message Snippet</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Received</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No contact requests received yet.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{req.name}</div>
                        <div className="text-xs text-slate-400">{req.email} • {req.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{req.subject || 'General Inquiry'}</td>
                      <td className="p-4 text-xs max-w-xs truncate">{req.message}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleCompleted(req)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center space-x-1 ${
                            req.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {req.status === 'completed' ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
                          <span className="capitalize">{req.status}</span>
                        </button>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500"
                          title="View Full Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, id: req.id, name: req.name })}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500"
                          title="Delete Request"
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

      {/* Message Detail Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Inquiry Details</h3>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">From</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedReq.name} ({selectedReq.email})</p>
                <p className="text-xs text-slate-400">Phone: {selectedReq.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Subject</span>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedReq.subject || 'General Inquiry'}</p>
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Message</span>
                <p className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap mt-1">
                  {selectedReq.message}
                </p>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={() => setSelectedReq(null)} className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Contact Request"
        message={`Are you sure you want to delete inquiry from "${deleteModal.name}"?`}
        confirmText="Delete Inquiry"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
      />
    </div>
  );
}
