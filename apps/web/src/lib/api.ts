const BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}/v1`
  : 'http://localhost:3001/v1';

async function request<T>(path: string, opts: RequestInit = {}, isFormData = false): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
  };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, isFormData?: boolean) =>
    request<T>(path, { method: 'POST', body: isFormData ? (body as FormData) : JSON.stringify(body) }, isFormData),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
