import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="space-y-2">
          <Link to="/admin/login" className="inline-flex items-center text-xs text-slate-400 hover:text-emerald-400 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-slate-400 text-sm">
            Enter your admin email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm space-y-2">
            <p className="font-semibold">Check your inbox!</p>
            <p className="text-xs text-emerald-400/80">
              We have dispatched a secure password reset link to <span className="font-bold">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                Registered Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@esaleagreement.in"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
