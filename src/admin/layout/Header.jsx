import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Sun, Moon, LogOut, User, Search, ShieldCheck } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function Header({ setMobileOpen, darkMode, setDarkMode }) {
  const { user, adminProfile, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Mobile Toggle & Page Search */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative hidden sm:block w-64 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dashboard, services, users..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition"
            />
          </div>
        </div>

        {/* Right: Theme Toggle & Admin Profile Dropdown */}
        <div className="flex items-center space-x-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Profile Quick Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm">
                {adminProfile?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                  {adminProfile?.full_name || 'Admin'}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium capitalize mt-0.5">
                  {adminProfile?.role || 'super_admin'}
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.email || 'admin@esaleagreement.in'}
                    </p>
                  </div>

                  <a
                    href="#/admin/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                  >
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>Admin Profile</span>
                  </a>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Logout Confirmation"
        message="Are you sure you want to end your admin session?"
        confirmText="Logout Now"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
