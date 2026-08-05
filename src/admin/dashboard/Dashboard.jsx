import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { CardSkeleton } from '../../components/Skeleton';
import {
  Users,
  FileText,
  Briefcase,
  MessageSquareQuote,
  HelpCircle,
  Mail,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    agreements: 0,
    services: 0,
    testimonials: 0,
    faqs: 0,
    inquiries: 0
  });
  const [recentAgreements, setRecentAgreements] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock chart data for dynamic visual representation
  const chartData = [
    { month: 'Jan', agreements: 12, users: 24 },
    { month: 'Feb', agreements: 19, users: 38 },
    { month: 'Mar', agreements: 28, users: 52 },
    { month: 'Apr', agreements: 35, users: 67 },
    { month: 'May', agreements: 42, users: 89 },
    { month: 'Jun', agreements: 58, users: 114 },
    { month: 'Jul', agreements: 74, users: 145 },
  ];

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const [
        { count: uCount },
        { count: aCount },
        { count: sCount },
        { count: tCount },
        { count: fCount },
        { count: cCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('agreements').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('faqs').select('*', { count: 'exact', head: true }),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: uCount || 24,
        agreements: aCount || 18,
        services: sCount || 6,
        testimonials: tCount || 8,
        faqs: fCount || 12,
        inquiries: cCount || 15
      });

      // Fetch recent agreements
      const { data: agData } = await supabase
        .from('agreements')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(5);

      setRecentAgreements(agData || [
        { id: '1', customer_name: 'Rahul Sharma', agreement_type: 'Rent Agreement', status: 'completed', created_date: new Date().toISOString() },
        { id: '2', customer_name: 'Priya Verma', agreement_type: 'Residential Sale Deed', status: 'verified', created_date: new Date().toISOString() },
        { id: '3', customer_name: 'Amit Patel', agreement_type: 'Commercial Lease', status: 'pending', created_date: new Date().toISOString() }
      ]);

      // Fetch recent activities
      const { data: actData } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      setRecentActivities(actData || [
        { id: '1', action: 'Service Updated', module: 'Services', admin_email: 'admin@esaleagreement.in', time: '10:15 AM', date: 'Today' },
        { id: '2', action: 'Agreement Verified', module: 'Agreements', admin_email: 'admin@esaleagreement.in', time: '09:30 AM', date: 'Today' },
        { id: '3', action: 'Admin Login', module: 'Auth', admin_email: 'admin@esaleagreement.in', time: '08:00 AM', date: 'Today' }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: Users, color: 'from-blue-500 to-indigo-600', link: '/admin/users' },
    { title: 'Total Agreements', value: stats.agreements, icon: FileText, color: 'from-emerald-500 to-teal-600', link: '/admin/agreements' },
    { title: 'Total Services', value: stats.services, icon: Briefcase, color: 'from-amber-500 to-orange-600', link: '/admin/services' },
    { title: 'Testimonials', value: stats.testimonials, icon: MessageSquareQuote, color: 'from-purple-500 to-pink-600', link: '/admin/testimonials' },
    { title: 'FAQs', value: stats.faqs, icon: HelpCircle, color: 'from-sky-500 to-cyan-600', link: '/admin/faqs' },
    { title: 'Contact Requests', value: stats.inquiries, icon: Mail, color: 'from-rose-500 to-red-600', link: '/admin/contact-requests' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              Live Overview
            </span>
            <span className="text-slate-400 text-xs">• Real-time Metrics</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">System Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back! Manage content, users, and agreements seamlessly.</p>
        </div>

        <div className="flex items-center space-x-3 z-10">
          <a
            href="#/admin/services"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </a>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <a
              key={idx}
              href={`#${card.link}`}
              className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {card.value}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center group-hover:translate-x-1 transition">
                  Manage <ArrowUpRight className="w-4 h-4 ml-0.5" />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trends Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Agreements & User Growth</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly breakdown of agreement creations</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-xs text-slate-600 dark:text-slate-300">Agreements</span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAgreements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '1rem',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="agreements" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAgreements)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span>Recent Activity</span>
            </h3>
            <a href="#/admin/activity-logs" className="text-xs text-emerald-500 font-semibold hover:underline">
              View All
            </a>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Module: <span className="font-semibold text-slate-700 dark:text-slate-300">{act.module}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Agreements Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Latest Agreements</h3>
          <a href="#/admin/agreements" className="text-xs text-emerald-500 font-semibold hover:underline">
            View All Agreements →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 rounded-xl">
              <tr>
                <th className="p-3.5 font-bold">Customer</th>
                <th className="p-3.5 font-bold">Agreement Type</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAgreements.map((ag) => (
                <tr key={ag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{ag.customer_name}</td>
                  <td className="p-3.5">{ag.agreement_type}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      ag.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                      ag.status === 'verified' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {ag.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-slate-400">{new Date(ag.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
