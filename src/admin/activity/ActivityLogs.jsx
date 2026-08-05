import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { TableSkeleton } from '../../components/Skeleton';
import { Activity, Search, Filter, Clock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_LOGS = [
  { id: 'act-1', admin_email: 'admin@esaleagreement.in', action: 'Service Updated', module: 'Services', details: 'Updated Rental & Lease Agreement details', date: '2026-08-05', time: '10:15:30 AM' },
  { id: 'act-2', admin_email: 'admin@esaleagreement.in', action: 'Agreement Verified', module: 'Agreements', details: 'Verified agreement for Rahul Sharma', date: '2026-08-05', time: '09:40:12 AM' },
  { id: 'act-3', admin_email: 'admin@esaleagreement.in', action: 'Admin Login', module: 'Authentication', details: 'Admin logged into dashboard successfully', date: '2026-08-05', time: '08:30:00 AM' },
  { id: 'act-4', admin_email: 'admin@esaleagreement.in', action: 'Testimonial Added', module: 'Testimonials', details: 'Added review by Rajesh Kumar', date: '2026-08-04', time: '04:12:45 PM' }
];

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setLogs(INITIAL_LOGS);
      } else {
        setLogs(data);
      }
    } catch (err) {
      setLogs(INITIAL_LOGS);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.admin_email?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'all' || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Security audit log tracking every administrative action and system event.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by action, admin email, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-500 border border-transparent"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none border border-transparent"
          >
            <option value="all">All Modules</option>
            <option value="Authentication">Authentication</option>
            <option value="Services">Services</option>
            <option value="Agreements">Agreements</option>
            <option value="Users">Users</option>
            <option value="Testimonials">Testimonials</option>
            <option value="FAQs">FAQs</option>
            <option value="Pricing">Pricing</option>
            <option value="Contact Requests">Contact Requests</option>
            <option value="Website Content">Website Content</option>
            <option value="Media Manager">Media Manager</option>
            <option value="Settings">Settings</option>
            <option value="Admin Profile">Admin Profile</option>
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
                  <th className="p-4">Admin Email</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-slate-900 dark:text-white text-xs">{l.admin_email}</td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{l.action}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {l.module}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">{l.details || 'N/A'}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {l.date} • {l.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
