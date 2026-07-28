export function getOptimizedImageUrl(url: string, width: number = 800, height: number = 400) {
  if (!url) return '';
  // Cloudinary URL से फाइल पथ निकालें
  const parts = url.split('/upload/');
  if (parts.length < 2) return url;
  const base = parts[0];
  const path = parts[1];
  // Transformations apply करें: WebP, quality auto, resize to given dimensions, crop fill
  const transformations = `c_fill,w_${width},h_${height},f_webp,q_auto`;
  return `${base}/upload/${transformations}/${path}`;
}