import { useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import type { Business } from '@/lib/types';
import { FullPageLoader } from '@/components/States';
import { Logo } from '@/components/Logo';
import { AppShell, type Page } from '@/components/AppShell';
import { Login } from '@/pages/Login';
import { SignUp } from '@/pages/SignUp';
import { CreateBusiness, checkExistingBusiness } from '@/pages/CreateBusiness';
import { Dashboard } from '@/pages/Dashboard';
import { DailyEntry } from '@/pages/DailyEntry';
import { GateScreen } from '@/pages/GateScreen';
import { CoachChat } from '@/pages/CoachChat';
import { LandingPage } from '@/pages/LandingPage';
import { PrivacyNotice } from '@/pages/PrivacyNotice';
import { PricingCard } from '@/components/PricingCard';
import { EquityAgreementStep } from '@/components/EquityAgreement';
import { acceptEquityAgreement } from '@/lib/api';
import { useAuth as useAuthHook } from '@/lib/auth';

type AuthView = 'landing' | 'login' | 'signup' | 'privacy';

function FoundStepApp() {
  const { session, loading } = useAuth();

  if (loading) return <FullPageLoader message="Loading FoundStep..." />;
  if (!session) return <AuthGate />;

  return <AuthenticatedApp />;
}

function AuthGate() {
  const [view, setView] = useState<AuthView>('landing');
  const go = () => window.location.reload();

  if (view === 'signup') return <SignUp onSuccess={go} onViewPrivacy={() => setView('privacy')} />;
  if (view === 'privacy') return <PrivacyNotice onBack={() => setView('signup')} />;
  if (view === 'login') return <Login onSwitchToSignUp={() => setView('signup')} onSuccess={go} />;
  return <LandingPage onGetStarted={() => setView('signup')} onSignIn={() => setView('login')} />;
}

function AgreementGate({ onAccepted }: { onAccepted: () => Promise<void> }) {
  const { signOut } = useAuthHook();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setError(null);
    setLoading(true);
    const saved = await acceptEquityAgreement();
    if (!saved) {
      setError('We could not save your agreement. Please try again.');
      setLoading(false);
      return;
    }
    await onAccepted();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <EquityAgreementStep onAccept={handleAccept} loading={loading} error={error} submitLabel="Accept and continue" />
        <button
          onClick={() => signOut()}
          className="mt-6 text-center text-sm font-semibold text-neutral-500 hover:text-neutral-700"
        >
          Sign out instead
        </button>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { user, profile, refreshProfile } = useAuthHook();
  const [business, setBusiness] = useState<Business | null | undefined>(undefined);
  const [page, setPage] = useState<Page>('dashboard');

  const loadBusiness = useCallback(async () => {
    if (!user) return;
    const existing = await checkExistingBusiness();
    setBusiness(existing);
  }, [user]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  if (profile && !profile.equity_agreement_accepted_at) {
    return <AgreementGate onAccepted={refreshProfile} />;
  }

  if (business === undefined) return <FullPageLoader message="Loading your business..." />;

  if (business === null) {
    return <CreateBusiness onCreated={(biz) => setBusiness(biz)} />;
  }

  return (
    <AppShell currentPage={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard businessId={business.id} onNavigate={setPage} />}
      {page === 'chat' && <CoachChat businessId={business.id} />}
      {page === 'daily' && <DailyEntry businessId={business.id} />}
      {page === 'gate' && <GateScreen businessId={business.id} />}
      {page === 'settings' && <SettingsView />}
    </AppShell>
  );
}

function SettingsView() {
  const { profile, signOut } = useAuthHook();
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">Settings</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Your account details.</p>
      </div>
      <div className="card space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
            <Logo size="sm" markOnly />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{profile?.full_name ?? 'Founder'}</p>
            <p className="text-xs text-neutral-500">{profile?.email ?? '—'}</p>
          </div>
        </div>
        <div className="border-t border-neutral-100 pt-3 text-sm text-neutral-600">
          <p>Role: <span className="font-medium text-neutral-900">{profile?.role ?? 'founder'}</span></p>
          <p>Country: <span className="font-medium text-neutral-900">{profile?.country ?? 'Nigeria'}</span></p>
          {profile?.state && <p>State: <span className="font-medium text-neutral-900">{profile.state}</span></p>}
          {profile?.phone && <p>Phone: <span className="font-medium text-neutral-900">{profile.phone}</span></p>}
        </div>
      </div>
      <PricingCard />
      <button onClick={() => signOut()} className="btn-secondary w-full">
        Sign out
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FoundStepApp />
    </AuthProvider>
  );
}
