/**
 * Generic fetch wrapper for the Express backend.
 * Mirrors the Customer App's client.ts pattern.
 */
import { API_BASE_URL } from '../config/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

/**
 * Base fetch helper with JWT injection and JSON parsing.
 */
export async function fetchApi<T>(
  path: string,
  options?: FetchOptions,
): Promise<T> {
  const { token, ...init } = options ?? {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed: ${res.status}`,
    );
  }

  return data as T;
}

/**
 * Multipart/form-data upload helper for document/image uploads.
 * Does NOT set Content-Type (browser/RN sets boundary automatically).
 */
export async function uploadFile<T>(
  path: string,
  formData: FormData,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Upload failed: ${res.status}`,
    );
  }

  return data as T;
}
