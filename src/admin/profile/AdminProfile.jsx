import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase/client';
import { uploadToCloudinary } from '../../cloudinary/upload';
import { logActivity } from '../../utils/activityLogger';
import { User, Lock, Upload, Save, ShieldCheck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const { user, adminProfile, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState(adminProfile?.full_name || 'Super Administrator');
  const [avatarUrl, setAvatarUrl] = useState(adminProfile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPass, setUpdatingPass] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl
      });
      toast.success('Admin profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      setAvatarUrl(result.url);
      toast.success('Avatar uploaded to Cloudinary');
    } catch (err) {
      toast.error('Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword) return;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setUpdatingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      toast.success('Password updated successfully!');
      await logActivity(user?.email, 'Password Changed', 'Admin Profile', 'Updated account password');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Profile & Security</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage personal admin details and login password.</p>
      </div>

      {/* Account Badge Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 text-white flex items-center space-x-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
          {fullName?.charAt(0) || 'A'}
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold">{fullName}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30">
              {adminProfile?.role || 'super_admin'}
            </span>
          </div>
          <p className="text-xs text-slate-400">{user?.email || 'admin@esaleagreement.in'}</p>
        </div>
      </div>

      {/* Update Profile Info */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <User className="w-5 h-5 text-emerald-500" />
          <span>Edit Profile Details</span>
        </h3>

        <form onSubmit={handleProfileSave} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Profile Image (Cloudinary)</label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <label className="px-4 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl cursor-pointer font-semibold transition shrink-0 flex items-center space-x-1">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>

          <button type="submit" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Lock className="w-5 h-5 text-amber-500" />
          <span>Change Admin Password</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingPass}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{updatingPass ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
