/**
 * Cloudinary URL optimization utility
 * Inserts dynamic f_auto,q_auto,w_{width},c_limit transformations
 * Works seamlessly in both Server and Client Components.
 */
export function optimizeCloudinaryUrl(url: string, width = 600): string {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('/upload/f_') || url.includes('/upload/w_')) {
      return url;
    }
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return url;
}
