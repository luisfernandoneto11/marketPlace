export type ErrorType<T> = T & { status: number; statusText: string; data?: Record<string, unknown> };
export type BodyType<T> = T;
export type AuthTokenGetter = () => string | null | Promise<string | null>;

export function setBaseUrl(_url: string): void {}
export function setAuthTokenGetter(_getter: AuthTokenGetter): void {}

export const customFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw Object.assign(new Error(response.statusText), {
      status: response.status,
      statusText: response.statusText,
      data,
    });
  }
  return response.json() as Promise<T>;
};
