// window.storage shim for playground use.
// The real artifact runtime exposes an async key-value store with shared/private scopes.
// This shim writes to localStorage so playground state survives reloads.
// REMOVE before copying code back into an artifact.

type Options = { shared?: boolean };

function scoped(key: string, opts?: Options){
  return `${opts?.shared ? "shared:" : "private:"}${key}`;
}

export const storage = {
  async set(key: string, value: unknown, opts?: Options){
    localStorage.setItem(scoped(key, opts), JSON.stringify(value));
  },
  async get<T = unknown>(key: string, opts?: Options): Promise<T | null> {
    const raw = localStorage.getItem(scoped(key, opts));
    return raw ? JSON.parse(raw) as T : null;
  },
  async delete(key: string, opts?: Options){
    localStorage.removeItem(scoped(key, opts));
  },
  async list(opts?: Options){
    const prefix = opts?.shared ? "shared:" : "private:";
    return Object.keys(localStorage).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length));
  },
};

// Install on window for drop-in parity with the artifact runtime.
declare global {
  interface Window { storage: typeof storage; }
}
if (typeof window !== "undefined") window.storage = storage;
