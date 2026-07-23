import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadVideo(file: Blob, path: string) {
  const { error } = await supabase.storage.from("videos").upload(path, file, {
    upsert: true,
    contentType: "video/mp4",
  });
  if (error) throw error;

  const { data } = supabase.storage.from("videos").getPublicUrl(path);
  return data.publicUrl;
}
