import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const localUrl = localStorage.getItem('supabase_url');
const localKey = localStorage.getItem('supabase_anon_key');

export const supabaseUrl = localUrl || envUrl || '';
export const supabaseAnonKey = localKey || envKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please provide them in your environment variables or via the UI.');
}

const memoryLock = (() => {
  let isLocked = false;
  const queue: (() => void)[] = [];
  return async <R>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
    if (isLocked) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    isLocked = true;
    try {
      return await fn();
    } finally {
      isLocked = false;
      if (queue.length > 0) {
        queue.shift()!();
      }
    }
  };
})();

export const supabase = (globalThis as any).supabase || createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      lock: memoryLock
    }
  }
);

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_anon_key', key);
  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('supabase_url');
  localStorage.removeItem('supabase_anon_key');
  window.location.reload();
};

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).supabase = supabase;
}
