'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.unreadCount === 'number')
          setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }, [user]);

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 transition-colors duration-300">
      {/* Left - Context Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold text-foreground/80 tracking-wide uppercase">
          {user?.accountType === 'business'
            ? 'Business Dashboard'
            : 'Client Dashboard'}
        </h2>
      </div>

      {/* Right - Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 text-foreground/60 hover:text-emerald-primary hover:bg-emerald-soft/10 rounded-full transition-all group"
        >
          <Bell
            size={20}
            className="group-active:scale-90 transition-transform"
          />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-emerald-primary text-white text-[10px] font-bold min-w-4 h-4 flex items-center justify-center rounded-full border-2 border-card leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-2">
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="text-foreground font-semibold text-xs truncate max-w-30">
              {user?.name || user?.email}
            </span>
            <span className="text-[10px] text-emerald-primary font-bold uppercase tracking-widest opacity-80">
              {user?.accountType}
            </span>
          </div>

          <div className="w-9 h-9 bg-emerald-primary/10 border border-emerald-primary/20 text-emerald-primary rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
            {(user?.name || user?.email)?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
