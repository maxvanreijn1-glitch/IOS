import '../context/styles/global.css';
import Link from 'next/link';
import { AuthProvider } from '@/context/AuthContext';
import CookieBanner from '@/components/CookieBanner';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    // Added suppressHydrationWarning here
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex-1">{children}</div>

            {/* Dark-mode friendly footer */}
            <footer className="bg-background border-t border-border py-6 px-6 text-center text-xs text-muted-foreground">
              <p className="mb-2">
                &copy; {year} Deliverance. Meetings Managed. All rights
                reserved.
              </p>
              <nav className="flex justify-center gap-6">
                <Link
                  href="/terms"
                  className="hover:text-emerald-primary transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="hover:text-emerald-primary transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-emerald-primary transition-colors"
                >
                  Contact
                </Link>
              </nav>
            </footer>

            <CookieBanner />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
