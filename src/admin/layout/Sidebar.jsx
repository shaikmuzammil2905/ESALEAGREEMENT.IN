import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  MessageSquareQuote,
  HelpCircle,
  CreditCard,
  Mail,
  Globe,
  Image as ImageIcon,
  Settings,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Services', path: '/admin/services', icon: Briefcase },
    { name: 'Agreements', path: '/admin/agreements', icon: FileText },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
    { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
    { name: 'Pricing Plans', path: '/admin/pricing', icon: CreditCard },
    { name: 'Contact Requests', path: '/admin/contact-requests', icon: Mail },
    { name: 'Website Content', path: '/admin/website-content', icon: Globe },
    { name: 'Media Manager', path: '/admin/media', icon: ImageIcon },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
    { name: 'Activity Logs', path: '/admin/activity-logs', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-emerald-500/20">
              eS
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-white tracking-wide leading-none">
                  eSale<span className="text-emerald-400">Admin</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                  Control Center
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition text-sm font-medium"
            title="View Public Site"
          >
            <ExternalLink className="w-5 h-5 text-emerald-400 shrink-0" />
            {!collapsed && <span>View Main Website</span>}
          </a>
        </div>
      </aside>
    </>
  );
}
