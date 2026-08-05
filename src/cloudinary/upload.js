const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'fz0eqlir';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

/**
 * Uploads a file (File object or Blob) to Cloudinary
 * @param {File} file 
 * @returns {Promise<{url: string, public_id: string, format: string, bytes: number}>}
 */
export async function uploadToCloudinary(file) {
  if (!file) throw new Error('No file provided for upload');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data = await res.json();
    return {
      url: data.secure_url || data.url,
      public_id: data.public_id,
      format: data.format,
      bytes: data.bytes
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
}
