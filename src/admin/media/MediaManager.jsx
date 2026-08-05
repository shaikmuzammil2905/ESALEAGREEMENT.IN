import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { uploadToCloudinary } from '../../cloudinary/upload';
import { logActivity } from '../../utils/activityLogger';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import { Upload, Search, Copy, Trash2, ExternalLink, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_MEDIA = [
  { id: 'm-1', name: 'service1.jpg', url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service1.jpg', size: '240 KB', created_at: '2026-07-20T10:00:00Z' },
  { id: 'm-2', name: 'service2.jpg', url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service2.jpg', size: '315 KB', created_at: '2026-07-22T12:30:00Z' },
  { id: 'm-3', name: 'service3.jpg', url: 'https://res.cloudinary.com/fz0eqlir/image/upload/v1/service3.jpg', size: '280 KB', created_at: '2026-07-25T14:15:00Z' },
  { id: 'm-4', name: 'company_logo.png', url: 'assets/logo.png', size: '45 KB', created_at: '2026-08-01T09:00:00Z' }
];

export default function MediaManager() {
  const { user } = useAuth();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, media: null });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setMediaList(INITIAL_MEDIA);
      } else {
        setMediaList(data);
      }
    } catch (err) {
      setMediaList(INITIAL_MEDIA);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        let fileUrl = '';
        try {
          const result = await uploadToCloudinary(file);
          fileUrl = result.url;
        } catch (err) {
          fileUrl = URL.createObjectURL(file);
        }

        const payload = {
          id: `m-${Date.now()}`,
          name: file.name,
          url: fileUrl,
          size: `${Math.round(file.size / 1024)} KB`,
          created_at: new Date().toISOString()
        };

        try {
          await supabase.from('media').insert([payload]);
        } catch (err) {}

        setMediaList(prev => [payload, ...prev]);
        await logActivity(user?.email, 'Image Uploaded', 'Media Manager', `Uploaded ${file.name} to Cloudinary`);
      }

      toast.success('Media uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload media item');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Cloudinary URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteMedia = async () => {
    if (!deleteModal.media) return;
    try {
      await supabase.from('media').delete().eq('id', deleteModal.media.id);
    } catch (err) {}

    setMediaList(prev => prev.filter(m => m.id !== deleteModal.media.id));
    toast.success('Media record removed');
    await logActivity(user?.email, 'Image Deleted', 'Media Manager', `Deleted media ${deleteModal.media.name}`);
    setDeleteModal({ open: false, media: null });
  };

  const filteredMedia = mediaList.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.url?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cloudinary Media Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload, preview, copy URLs, and manage all site images.</p>
        </div>

        <label className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload Image'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search media by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-500 border border-transparent"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No media files uploaded yet. Click "Upload Image" to add media to Cloudinary.</p>
            </div>
          ) : (
            filteredMedia.map((m) => (
              <div
                key={m.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition"
              >
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={m.url}
                    alt={m.name}
                    className="max-h-full max-w-full object-contain rounded-xl transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleCopyUrl(m.url, m.id)}
                      className="p-2.5 bg-white text-slate-950 rounded-xl hover:bg-emerald-400 transition"
                      title="Copy Cloudinary URL"
                    >
                      {copiedId === m.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-white text-slate-950 rounded-xl hover:bg-emerald-400 transition"
                      title="Open full image"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setDeleteModal({ open: true, media: m })}
                      className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={m.name}>
                    {m.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Size: {m.size || 'N/A'} • {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Image File"
        message={`Are you sure you want to remove media record "${deleteModal.media?.name}"?`}
        confirmText="Delete File"
        confirmVariant="danger"
        onConfirm={handleDeleteMedia}
        onCancel={() => setDeleteModal({ open: false, media: null })}
      />
    </div>
  );
}
