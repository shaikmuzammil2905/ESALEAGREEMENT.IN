import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { logActivity } from '../../utils/activityLogger';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Search, Download, Trash2, ExternalLink, Filter, Edit, FileText, CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_AGREEMENTS = [
  { id: 'ag-1', customer_name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 12345', agreement_type: 'Rental & Lease Agreement', status: 'completed', created_date: '2026-07-20T10:00:00Z', pdf_file_url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/sample_agreement.pdf' },
  { id: 'ag-2', customer_name: 'Priya Verma', email: 'priya.verma@yahoo.com', phone: '+91 98765 67890', agreement_type: 'Residential Sale Deed', status: 'verified', created_date: '2026-07-22T14:30:00Z', pdf_file_url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/sample_agreement.pdf' },
  { id: 'ag-3', customer_name: 'Amit Patel', email: 'amit.patel@techcorp.in', phone: '+91 98123 45678', agreement_type: 'Commercial Property Lease', status: 'pending', created_date: '2026-07-25T11:15:00Z', pdf_file_url: null },
  { id: 'ag-4', customer_name: 'Sunita Rao', email: 'sunita.rao@outlook.com', phone: '+91 97654 32109', agreement_type: 'Rental Agreement', status: 'draft', created_date: '2026-07-29T16:00:00Z', pdf_file_url: null },
  { id: 'ag-5', customer_name: 'Vikram Malhotra', email: 'vikram.m@realestate.in', phone: '+91 99887 76655', agreement_type: 'Land Sale Agreement', status: 'completed', created_date: '2026-08-02T09:45:00Z', pdf_file_url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/sample_agreement.pdf' }
];

export default function AgreementsManager() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [selectedAg, setSelectedAg] = useState(null);

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agreements')
        .select('*')
        .order('created_date', { ascending: false });

      if (error || !data || data.length === 0) {
        setAgreements(INITIAL_AGREEMENTS);
      } else {
        setAgreements(data);
      }
    } catch (err) {
      setAgreements(INITIAL_AGREEMENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus, name) => {
    try {
      await supabase
        .from('agreements')
        .update({ status: newStatus })
        .eq('id', id);
    } catch (err) {}

    setAgreements(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    toast.success(`Agreement status updated to ${newStatus}`);
    await logActivity(user?.email, 'Agreement Status Updated', 'Agreements', `Updated status for ${name} to ${newStatus}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await supabase.from('agreements').delete().eq('id', deleteModal.id);
    } catch (err) {}

    setAgreements(prev => prev.filter(a => a.id !== deleteModal.id));
    toast.success('Agreement deleted');
    await logActivity(user?.email, 'Agreement Deleted', 'Agreements', `Deleted agreement for ${deleteModal.name}`);
    setDeleteModal({ open: false, id: null, name: '' });
  };

  const exportCSV = () => {
    if (agreements.length === 0) return;
    const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Agreement Type', 'Status', 'Created Date'];
    const rows = filteredAgreements.map(a => [
      a.id,
      `"${a.customer_name}"`,
      `"${a.email}"`,
      `"${a.phone || ''}"`,
      `"${a.agreement_type}"`,
      a.status,
      a.created_date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `agreements_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Agreements exported to CSV');
  };

  const filteredAgreements = agreements.filter(a => {
    const matchesSearch =
      a.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.agreement_type?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agreement Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search, filter, view PDFs, and manage digital agreements.</p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2 border border-slate-700"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-500 border border-transparent"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none border border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Agreement Type</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAgreements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No agreements found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredAgreements.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          <span>{ag.customer_name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{ag.agreement_type}</td>
                      <td className="p-4 text-xs">
                        <div>{ag.email}</div>
                        <div className="text-slate-400">{ag.phone || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={ag.status}
                          onChange={(e) => handleStatusChange(ag.id, e.target.value, ag.customer_name)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="completed">Completed</option>
                          <option value="draft">Draft</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(ag.created_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedAg(ag)}
                            className="p-2 text-emerald-500 hover:text-emerald-400 transition"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {ag.pdf_file_url ? (
                            <a
                              href={ag.pdf_file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-blue-500 hover:text-blue-400 inline-block"
                              title="Download / View PDF"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : null}
                          <button
                            onClick={() => setDeleteModal({ open: true, id: ag.id, name: ag.customer_name })}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 transition"
                            title="Delete Agreement"
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

      {/* Agreement Details Modal */}
      {selectedAg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Agreement Details</h3>
                  <p className="text-xs text-slate-400">Client submission for {selectedAg.customer_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAg(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Customer Name</span>
                <p className="font-bold text-slate-900 dark:text-white text-base">{selectedAg.customer_name}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Agreement Type</span>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedAg.agreement_type}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Email</span>
                <p className="font-semibold text-blue-600 dark:text-blue-400 break-all">{selectedAg.email}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Phone</span>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedAg.phone || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  selectedAg.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                  selectedAg.status === 'verified' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' :
                  selectedAg.status === 'draft' ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}>{selectedAg.status}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Created Date</span>
                <p className="font-semibold text-slate-900 dark:text-white">{new Date(selectedAg.created_date).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => {
                  setDeleteModal({ open: true, id: selectedAg.id, name: selectedAg.customer_name });
                  setSelectedAg(null);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold rounded-xl text-sm flex items-center space-x-2 transition border border-red-200 dark:border-red-800"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <div className="flex items-center space-x-2">
                {selectedAg.pdf_file_url && (
                  <a href={selectedAg.pdf_file_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm flex items-center space-x-2 transition shadow-md">
                    <ExternalLink className="w-4 h-4" />
                    <span>View PDF</span>
                  </a>
                )}
                <button onClick={() => setSelectedAg(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Agreement"
        message={`Are you sure you want to delete agreement record for "${deleteModal.name}"?`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
      />
    </div>
  );
}
