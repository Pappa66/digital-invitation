'use client';

import { useEffect, useState } from 'react';
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

  const activeItem = NAV.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
  const title = activeItem?.label ?? 'Dashboard';

  return (
    <div className="flex min-h-screen bg-dashboard-bg">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-dashboard-border bg-dashboard-surface md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-dashboard-border px-5">
          <Image src="/logo/prasha.png" width={32} height={32} alt="Prasha Digital" className="h-8 w-8 rounded-md bg-black object-cover" />
          <span className="truncate text-sm font-semibold">Prasha Digital</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  active ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] text-white shadow-sm' : 'text-[#4a443c] hover:bg-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-dashboard-border p-3">
          <div className="mb-2 truncate px-3 text-xs text-[#8a7a66]">{email}</div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-[#4a443c]">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-dashboard-border bg-dashboard-surface px-6">
          <h1 className="font-semibold">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto p-6 pb-20 md:pb-6">{children}</main>
      </div>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-dashboard-border bg-dashboard-surface px-2 py-1.5 md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-[10px] ${active ? 'text-[#c9a45c]' : 'text-[#8a7a66]'}`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}