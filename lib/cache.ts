export function cacheSet(key: string, value: string, ttl: number) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export function cacheGet(key: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
} 