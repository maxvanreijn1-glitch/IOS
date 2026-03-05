'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const businessNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const clientNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const navItems = user?.accountType === 'business' ? businessNav : clientNav;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 bg-card border-r border-border flex flex-col justify-between py-6 relative z-40`}
    >
      {/* Top Section */}
      <div>
        {/* Logo & Toggle */}
        <div
          className={`flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-6'} mb-10`}
        >
          {!collapsed && (
            <h1 className="text-xl font-bold text-emerald-primary tracking-tight">
              MeetFlow
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-emerald-soft/10 transition-colors text-foreground opacity-60 hover:opacity-100 border border-transparent hover:border-border"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group
                  ${
                    isActive
                      ? 'bg-emerald-primary text-white shadow-lg shadow-emerald-primary/20'
                      : 'text-foreground opacity-70 hover:opacity-100 hover:bg-emerald-soft/10 hover:text-emerald-primary'
                  }
                `}
              >
                <Icon
                  size={20}
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-white'
                      : 'text-emerald-primary opacity-60 group-hover:opacity-100'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section (Logout) */}
      <div className="px-4 border-t border-border pt-6">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground opacity-60 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-medium group`}
        >
          <LogOut
            size={20}
            className="shrink-0 group-hover:rotate-12 transition-transform"
          />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
