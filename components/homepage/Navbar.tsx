'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Leaf } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Toggle Body Scroll for Mobile Menu
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);

  // Handle Navbar Background on Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled || isOpen
          ? 'bg-background/80 backdrop-blur-md border-b border-border py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="bg-emerald-primary p-2 rounded-xl text-white shadow-lg shadow-emerald-primary/30 group-hover:scale-110 transition-transform">
            <Leaf className="size-5" fill="currentColor" />
          </div>
          <span className="text-xl font-black tracking-tighter">
            Meet<span className="text-emerald-primary">Flow</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-1 bg-card/50 border border-border p-1 rounded-full px-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-3 py-1.5 text-sm font-medium opacity-70 hover:opacity-100 hover:text-emerald-primary transition-all"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* ACTIONS (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-semibold px-4 hover:text-emerald-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full bg-emerald-primary px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-emerald-primary/20 hover:bg-emerald-hover transition-all"
          >
            Get Started
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-2 md:hidden z-50">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-foreground active:scale-90 transition-transform"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 bg-background transition-all duration-500 ease-in-out md:hidden ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="flex flex-col h-full pt-24 pb-12 px-8">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-4xl font-black border-b border-border/50 pb-4"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <Link
              href="/register"
              className="w-full bg-emerald-primary text-white py-5 rounded-2xl text-center font-bold shadow-xl text-lg"
              onClick={() => setIsOpen(false)}
            >
              Get Started for Free
            </Link>
            <Link
              href="/login"
              className="w-full py-5 rounded-2xl text-center font-bold border border-border text-lg"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
