import { supabase } from '../supabase/client';

/**
 * Records an admin action in activity_logs
 * @param {string} adminEmail 
 * @param {string} action (e.g. "Service Added", "User Blocked")
 * @param {string} module (e.g. "Services", "Users", "Auth")
 * @param {string} details 
 * @param {string} [adminId] 
 */
export async function logActivity(adminEmail, action, module, details = '', adminId = '') {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    await supabase.from('activity_logs').insert([{
      admin_id: adminId || 'admin-sys',
      admin_email: adminEmail || 'admin@esaleagreement.in',
      action,
      module,
      details,
      date: dateStr,
      time: timeStr
    }]);
  } catch (err) {
    console.warn('Failed to record activity log:', err);
  }
}
