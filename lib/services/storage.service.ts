import { createClient } from '@/lib/supabase/client';

export const storageService = {
  async uploadFile(bucket: string, path: string, file: File) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;
    return data;
  },

  async getPublicUrl(bucket: string, path: string) {
    const supabase = createClient();
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  async deleteFile(bucket: string, path: string) {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
  },
};

