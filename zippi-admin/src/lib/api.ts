const API_BASE: string = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'zippi_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: { field: string; message: string }[];
  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as any) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let json: any = null;
  try { json = await res.json(); } catch { /* non-JSON */ }

  if (!res.ok || json?.success === false) {
    if (res.status === 401) setToken(null);
    throw new ApiRequestError(json?.message || `Request failed (${res.status})`, res.status, json?.error, json?.details);
  }
  return json?.data as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'DELETE', ...(body ? { body: JSON.stringify(body) } : {}) })
};

/** Upload an image; returns its public URL. */
export async function uploadImage(file: File, folder: 'products' | 'banners' | 'categories' | 'misc'): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const data = await api.post<{ url: string; path: string }>(`/admin/uploads?folder=${folder}`, fd);
  return data.url;
}
