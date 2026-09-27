export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
};
export function validateImageFile(file) {
  if (!file || !IMAGE_TYPES[file.type]) return 'Choose a PNG, JPG, WebP, or AVIF image.';
  if (!file.size || file.size > MAX_IMAGE_BYTES) return 'Choose an image smaller than 5 MB.';
  return null;
}
