'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme(); // Use resolvedTheme for better accuracy
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  const toggleTheme = () => {
    // This logs to your browser console to verify the click works
    console.log('Current theme:', theme);
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-emerald-soft transition-colors z-50"
    >
      <Sun className="h-5 w-5 dark:hidden text-emerald-primary" />
      <Moon className="hidden dark:block h-5 w-5 text-emerald-primary" />
    </button>
  );
}
