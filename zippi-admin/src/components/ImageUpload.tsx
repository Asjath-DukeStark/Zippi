import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/api';

/**
 * Reusable image uploader: picks a file, uploads it to the backend
 * (Supabase Storage) and reports the public URL via onChange.
 */
export default function ImageUpload({ value, onChange, folder, label = 'Image', aspect = 'aspect-square' }: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder: 'products' | 'banners' | 'categories' | 'misc';
  label?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-3">
        <div
          className={`relative w-28 ${aspect} shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-brand-500`}
          onClick={() => !busy && inputRef.current?.click()}
        >
          {busy ? (
            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /></div>
          ) : value ? (
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-400">
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px] font-semibold">Upload</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 text-xs text-slate-500">
          <p>JPEG, PNG, WebP, GIF or SVG. Max 5 MB.</p>
          {value && (
            <button type="button" className="inline-flex items-center gap-1 text-red-600 hover:underline" onClick={() => onChange(null)}>
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ''; }}
      />
    </div>
  );
}
