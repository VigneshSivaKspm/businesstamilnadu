import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Inbox, LayoutDashboard, LogOut, Menu, Settings, Store, UserPlus, X } from 'lucide-react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogoMark } from '@/components/common/Logo';
import { PageSkeleton } from '@/components/common/Skeleton';
import { useOverlay } from '@/hooks/useOverlay';
import { cn } from '@/lib/cn';
import { AdminProvider, useAdmin } from './AdminContext';

/** Root of /admin: provides auth state and keeps the panel out of search engines. */
export default function AdminShell() {
  return (
    <AdminProvider>
      <Helmet>
        <title>Admin | Business Tamil Nadu</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Suspense fallback={<FullScreenLoader />}>
        <Outlet />
      </Suspense>
    </AdminProvider>
  );
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper" role="status" aria-label="Loading">
      <span className="size-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-950" />
    </div>
  );
}

/** Redirects to the login screen when there's no valid session. */
export function RequireAdmin() {
  const { admin } = useAdmin();
  const location = useLocation();
  if (admin === undefined) return <FullScreenLoader />;
  if (!admin) return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <AdminLayout />;
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { stats } = useAdmin();
  const items = [
    { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
    { to: '/admin/registrations', label: 'Registrations', Icon: UserPlus, count: stats?.registrations.pending },
    { to: '/admin/messages', label: 'Messages', Icon: Inbox, count: stats?.messages.new },
    { to: '/admin/listings', label: 'Listings', Icon: Store },
    { to: '/admin/settings', label: 'Settings', Icon: Settings },
  ];
  return (
    <ul className="space-y-1">
      {items.map(({ to, label, Icon, end, count }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="size-4.5 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {!!count && (
              <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[0.6875rem] font-bold text-navy-950 tabular-nums" aria-label={`${count} new`}>
                {count}
              </span>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { admin, signOut } = useAdmin();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <LogoMark className="size-8 [&_rect]:fill-white/10" />
        <div className="leading-tight">
          <p className="text-sm font-extrabold tracking-wide text-white">BUSINESS TN</p>
          <p className="text-[0.6875rem] font-medium tracking-wider text-white/50 uppercase">Admin</p>
        </div>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <NavItems onNavigate={onNavigate} />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-4.5" aria-hidden />
          View website
        </a>
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold text-white">{admin?.name}</p>
        <p className="truncate text-xs text-white/50">{admin?.email}</p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/15 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { refreshStats } = useAdmin();
  const { pathname } = useLocation();
  useOverlay(menuOpen, drawerRef, closeMenu);

  // Keep sidebar badges current as the admin moves between screens.
  useEffect(() => {
    refreshStats();
    window.scrollTo({ top: 0 });
  }, [pathname, refreshStats]);

  return (
    <div className="min-h-dvh bg-paper lg:pl-64">
      <a
        href="#admin-main"
        className="sr-only z-[80] rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-navy-950 lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <LogoMark className="size-7" />
          <span className="text-sm font-extrabold tracking-wide text-navy-950">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="grid size-10 place-items-center rounded-lg text-navy-900 hover:bg-navy-50"
          aria-label="Open admin menu"
          aria-expanded={menuOpen}
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-navy-950/50" onClick={closeMenu} aria-hidden />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-navy-950 shadow-panel outline-none"
          >
            <button
              type="button"
              onClick={closeMenu}
              className="absolute top-3 right-3 grid size-10 place-items-center rounded-lg text-white/70 hover:bg-white/10"
              aria-label="Close admin menu"
            >
              <X className="size-5" aria-hidden />
            </button>
            <SidebarContent onNavigate={closeMenu} />
          </div>
        </div>
      )}

      <main id="admin-main" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
