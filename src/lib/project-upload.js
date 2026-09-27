import { requireSupabase } from './supabase';
import { validateImageFile, IMAGE_TYPES } from './project-images';
const bucket = 'project-images';
export async function uploadProjectImage(file) {
  const validation = validateImageFile(file);
  if (validation) throw new Error(validation);
  const storage = requireSupabase().storage.from(bucket);
  const path = crypto.randomUUID() + '.' + IMAGE_TYPES[file.type];
  const { error } = await storage.upload(path, file, { contentType: file.type, upsert: false });
  if (error)
    throw new Error(
      'Image upload failed: ' + error.message + '. Check the project-images bucket setup.'
    );
  return { path, url: storage.getPublicUrl(path).data.publicUrl };
}
// Only remove this attempt's new upload if saving its database record fails.
export async function discardProjectUpload(path) {
  const { error } = await requireSupabase().storage.from(bucket).remove([path]);
  if (error) throw error;
}
