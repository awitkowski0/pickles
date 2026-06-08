import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch {}
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
