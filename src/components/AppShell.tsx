import { type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { Home, Calendar, Flag, Settings, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { APP_NAME } from '@/lib/constants';

export type Page = 'dashboard' | 'chat' | 'daily' | 'gate' | 'settings';

interface AppShellProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

const NAV_ITEMS: { key: Page; label: string; icon: typeof Home }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'chat', label: 'Coach', icon: MessageCircle },
  { key: 'daily', label: 'Daily Entry', icon: Calendar },
  { key: 'gate', label: 'Gates', icon: Flag },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function AppShell({ currentPage, onNavigate, children }: AppShellProps) {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6 text-text" /> : <Menu className="h-6 w-6 text-text" />}
            </button>
            <Logo size="sm" />
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === item.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-border/90'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-text">{profile?.full_name ?? 'Founder'}</p>
              <p className="text-xs text-muted">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-border/90 hover:text-danger/90"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-text/20" />
          <nav className="absolute left-0 top-16 w-64 bg-surface shadow-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    currentPage === item.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-bg/90'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface md:hidden">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  currentPage === item.key
                    ? 'text-primary'
                    : 'text-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 md:pb-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="hidden border-t border-border py-4 md:block">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted">
          {APP_NAME} — Founders sell. We do the structure.
        </div>
      </footer>
    </div>
  );
}
