import { createClient } from "@supabase/supabase-js";

let supabaseInstance: any = null;

/**
 * Lazy initialization helper for Supabase Client.
 * Will return null if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured.
 */
export const getSupabaseClient = () => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

/**
 * Uploads an image file either to Supabase Storage ('products' bucket),
 * or falls back to a Base64 string that persists in localStorage to keep
 * the application robust and fully functional offline.
 */
export const uploadProductImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; isFallback: boolean }> => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const token = localStorage.getItem("zippi_admin_token");
      
      let prog = 10;
      const progressInterval = setInterval(() => {
        prog += 20;
        if (onProgress) onProgress(Math.min(prog, 90));
      }, 80);

      const response = await fetch("http://localhost:3001/api/admin/upload", {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData
      });
      
      clearInterval(progressInterval);
      if (onProgress) onProgress(100);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          return {
            url: result.url,
            isFallback: false
          };
        }
      }
    } catch (err) {
      console.warn("Backend server upload failed. Falling back to local Base64 storage.", err);
    }

    // Fallback: Read as base64 so it can persist inside localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Simulate fake upload progress for a better UI experience
      let prog = 0;
      const interval = setInterval(() => {
        prog += 25;
        if (onProgress) {
          onProgress(Math.min(prog, 95));
        }
      }, 100);

      reader.onloadend = () => {
        clearInterval(interval);
        if (onProgress) onProgress(100);
        resolve({
          url: reader.result as string,
          isFallback: true
        });
      };
      
      reader.onerror = () => {
        clearInterval(interval);
        reject(new Error("File reading failed"));
      };

      reader.readAsDataURL(file);
    });
  }

  // Real Supabase storage upload
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.floor(Math.random() * 100000)}.${fileExt}`;
  const filePath = `${fileName}`;

  // Supabase chunk upload progress estimation
  if (onProgress) onProgress(30);

  const { data, error } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (onProgress) onProgress(80);

  if (error) {
    // If bucket doesn't exist or upload fails, we explain/propagate
    throw error;
  }

  if (onProgress) onProgress(100);

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    isFallback: false
  };
};
