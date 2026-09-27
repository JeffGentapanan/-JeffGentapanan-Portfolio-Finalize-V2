export const MAX_PROJECTS = 100;
/** Reject executable schemes before values can reach a link or image element. */
export function isWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
export function validateProject(input) {
  if (!input.title.trim() || input.title.length > 80) return 'Enter a title of 1–80 characters.';
  if (!isWebUrl(input.url) || input.url.length > 2048)
    return 'Enter a complete HTTP or HTTPS project URL.';
  if (!input.category.trim() || input.category.length > 60)
    return 'Enter a category of 1–60 characters.';
  if (input.tagline.length > 2000) return 'Keep the description under 2,001 characters.';
  if (input.thumbnail && (!isImageUrl(input.thumbnail) || input.thumbnail.length > 2048))
    return 'Use an HTTP/HTTPS image URL or a /portfolio/ asset path.';
  return null;
}
export function decodeProjects(raw) {
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.length > MAX_PROJECTS)
    throw new Error('Invalid project collection.');
  const ids = new Set();
  for (const item of data) {
    if (
      !item ||
      typeof item !== 'object' ||
      !['id', 'title', 'url', 'category', 'tagline', 'thumbnail'].every(
        (key) => typeof item[key] === 'string'
      ) ||
      !item.id ||
      ids.has(item.id) ||
      validateProject(item)
    )
      throw new Error('Invalid project data.');
    ids.add(item.id);
  }
  return data;
}
/** Only packaged portfolio images or explicit web URLs are accepted. */
export function isImageUrl(value) {
  return isWebUrl(value) || /^\/portfolio\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|avif)$/i.test(value);
}
