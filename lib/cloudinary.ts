import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'digiculture_care',
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return null;
  }
  try {
    const afterUpload = url.split('/upload/')[1];
    if (!afterUpload) return null;
    // Strip version prefix if present, e.g. v1700000000/
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Strip file extension at the end (.jpg, .png, .webp, .mp3, etc.)
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    return publicId || null;
  } catch {
    return null;
  }
}

export async function deleteFromCloudinary(
  publicIdOrUrl: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<boolean> {
  const publicId = extractCloudinaryPublicId(publicIdOrUrl) || publicIdOrUrl;
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result.result === 'ok';
  } catch (error) {
    console.error(`Gagal menghapus aset ${publicId} dari Cloudinary:`, error);
    return false;
  }
}

export default cloudinary;
