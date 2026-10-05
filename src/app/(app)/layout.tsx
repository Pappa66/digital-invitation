'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LayoutTemplate, Inbox, Settings, LogOut, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV = [
  { href: '/dashboard', label: 'Undangan', icon: LayoutDashboard },
  { href: '/templates', label: 'Template', icon: LayoutTemplate },
  { href: '/dashboard/landing', label: 'Landing', icon: Globe },
  { href: '/orders', label: 'Kontak Masuk', icon: Inbox },
  { href: '/settings', label: 'Pengaturan', icon: Settings }
];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  // Longest-prefix match: aktif di subroute (mis. /templates/[id]) tanpa membuat
  // /dashboard ikut aktif saat berada di /dashboard/landing.
  const activeHref = useMemo(() => {
    return NAV.map((item) => item.href)
      .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
      .sort((a, b) => b.length - a.length)[0];
  }, [pathname]);

  const activeItem = NAV.find((item) => item.href === activeHref);
  const title = activeItem?.label ?? 'Dashboard';

  return (
    <div className="flex min-h-screen bg-dashboard-bg">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-dashboard-border bg-dashboard-surface md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-dashboard-border px-5">
          <Image src="/logo/prasha.png" width={32} height={32} alt="Prasha Digital" className="h-8 w-8 rounded-md bg-foreground object-cover" />
          <span className="truncate text-sm font-semibold">Prasha Digital</span>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Navigasi utama">
          {NAV.map((item) => {
            const active = item.href === activeHref;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-accent font-semibold text-accent-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-gold-strong transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                />
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-gold-strong' : ''}`} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-dashboard-border p-3">
          <div className="mb-2 truncate px-3 text-xs text-muted-foreground">{email}</div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Keluar
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-dashboard-border bg-dashboard-surface/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <Image
              src="/logo/prasha.png"
              width={28}
              height={28}
              alt="Prasha Digital"
              className="h-7 w-7 rounded-md bg-foreground object-cover"
            />
            <span className="truncate text-sm font-semibold">Prasha Digital</span>
          </div>
          <h1 className="hidden min-w-0 truncate font-semibold md:block">{title}</h1>
          <span className="ml-auto hidden max-w-[16rem] truncate text-xs text-muted-foreground md:block">{email}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Keluar"
            title="Keluar"
            className="ml-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:hidden"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </header>
        <main className="flex-1 overflow-auto px-4 py-5 pb-24 sm:px-6 md:pb-6">{children}</main>
      </div>
      {/* Mobile bottom nav — target sentuh ≥ 56px tinggi, ikon 24px, label 11px */}
      <nav aria-label="Navigasi utama" className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-dashboard-border bg-dashboard-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-8px_rgba(43,38,32,0.16)] md:hidden">
        {NAV.map((item) => {
          const active = item.href === activeHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium transition-colors ${
                active ? 'text-gold-deep' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span
                className={`relative flex items-center justify-center rounded-full px-3 py-1 transition-colors ${active ? 'bg-accent' : ''}`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                <span
                  aria-hidden
                  className={`absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold-strong transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}