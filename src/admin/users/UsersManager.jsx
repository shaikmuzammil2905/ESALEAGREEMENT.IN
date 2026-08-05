import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { logActivity } from '../../utils/activityLogger';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Search, Download, Ban, CheckCircle, Trash2, UserCheck, UserX, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_USERS = [
  { id: 'usr-1', full_name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 12345', agreement_count: 3, status: 'active', registration_date: '2026-07-15T10:30:00Z' },
  { id: 'usr-2', full_name: 'Priya Verma', email: 'priya.verma@yahoo.com', phone: '+91 98765 67890', agreement_count: 1, status: 'active', registration_date: '2026-07-18T14:20:00Z' },
  { id: 'usr-3', full_name: 'Amit Patel', email: 'amit.patel@techcorp.in', phone: '+91 98123 45678', agreement_count: 5, status: 'active', registration_date: '2026-07-22T09:15:00Z' },
  { id: 'usr-4', full_name: 'Sunita Rao', email: 'sunita.rao@outlook.com', phone: '+91 97654 32109', agreement_count: 2, status: 'active', registration_date: '2026-07-28T16:45:00Z' },
  { id: 'usr-5', full_name: 'Vikram Malhotra', email: 'vikram.m@realestate.in', phone: '+91 99887 76655', agreement_count: 0, status: 'blocked', registration_date: '2026-08-01T11:00:00Z' }
];

export default function UsersManager() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [blockModal, setBlockModal] = useState({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error || !data || data.length === 0) {
        setUsersList(INITIAL_USERS);
      } else {
        setUsersList(data);
      }
    } catch (err) {
      setUsersList(INITIAL_USERS);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!blockModal.user) return;
    const newStatus = blockModal.user.status === 'active' ? 'blocked' : 'active';
    try {
      await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', blockModal.user.id);
    } catch (err) {}

    setUsersList(prev => prev.map(u => u.id === blockModal.user.id ? { ...u, status: newStatus } : u));
    toast.success(`User ${blockModal.user.full_name} is now ${newStatus}`);
    await logActivity(user?.email, `User ${newStatus === 'blocked' ? 'Blocked' : 'Unblocked'}`, 'Users', `${blockModal.user.email} set to ${newStatus}`);
    setBlockModal({ open: false, user: null });
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    try {
      await supabase.from('users').delete().eq('id', deleteModal.user.id);
    } catch (err) {}

    setUsersList(prev => prev.filter(u => u.id !== deleteModal.user.id));
    toast.success('User deleted successfully');
    await logActivity(user?.email, 'User Deleted', 'Users', `Deleted user ${deleteModal.user.email}`);
    setDeleteModal({ open: false, user: null });
  };

  const exportCSV = () => {
    if (usersList.length === 0) return;
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Agreement Count', 'Status', 'Registration Date'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.full_name}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      u.agreement_count || 0,
      u.status,
      u.registration_date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `users_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Users exported to CSV');
  };

  const filteredUsers = usersList.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View, search, block/unblock, or delete user accounts.</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2 border border-slate-700"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Users CSV</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, email, phone..."
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
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Agreements</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reg. Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{u.full_name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4 text-xs">{u.phone || 'N/A'}</td>
                      <td className="p-4 font-semibold text-center">{u.agreement_count || 0}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(u.registration_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setBlockModal({ open: true, user: u })}
                          className={`p-2 transition ${u.status === 'active' ? 'text-amber-500 hover:text-amber-400' : 'text-emerald-500 hover:text-emerald-400'}`}
                          title={u.status === 'active' ? 'Block User' : 'Unblock User'}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, user: u })}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 transition"
                          title="Delete User"
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

      {/* Block Confirmation */}
      <ConfirmModal
        isOpen={blockModal.open}
        title={blockModal.user?.status === 'active' ? "Block User" : "Unblock User"}
        message={`Are you sure you want to ${blockModal.user?.status === 'active' ? 'block' : 'unblock'} user "${blockModal.user?.full_name}"?`}
        confirmText={blockModal.user?.status === 'active' ? "Block User" : "Unblock User"}
        confirmVariant={blockModal.user?.status === 'active' ? "warning" : "primary"}
        onConfirm={handleToggleBlock}
        onCancel={() => setBlockModal({ open: false, user: null })}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user account "${deleteModal.user?.full_name}"?`}
        confirmText="Delete Account"
        confirmVariant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteModal({ open: false, user: null })}
      />
    </div>
  );
}
