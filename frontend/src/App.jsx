import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import {
  HeartHandshake,
  ShieldCheck,
  Activity,
  LogIn,
  UserPlus,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut
} from 'lucide-react';

function Navigation({ activeView, setActiveView }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              DearHand
            </h1>
            <p className="text-xs font-semibold text-teal-700 mt-1 uppercase tracking-wider">
              Mysuru Pilot
            </p>
          </div>
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('home')}
            className={`px-3.5 py-2 rounded-xl text-base font-bold min-h-[44px] transition-colors ${
              activeView === 'home'
                ? 'bg-slate-100 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold min-h-[44px] transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard ({user?.name?.split(' ')[0]})
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveView('login')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-bold min-h-[44px] transition-colors ${
                  activeView === 'login'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>

              <button
                onClick={() => setActiveView('register')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm min-h-[44px] transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Join
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function HomeOverview({ setActiveView }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'API Unreachable');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/30 text-teal-200 border border-teal-400/40">
            <ShieldCheck className="w-4 h-4" />
            Vetted Helpers in Mysuru
          </span>
          <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            A trusted stand-in when you can't be there.
          </h2>
          <p className="text-lg md:text-xl text-teal-100 leading-relaxed font-normal">
            DearHand pairs elderly parents in Mysuru with background-verified, consistent helpers for hospital visits, errands, and daily companionship.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => setActiveView('register')}
              className="bg-teal-400 hover:bg-teal-300 text-teal-950 font-extrabold px-6 py-3.5 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            >
              Book for Your Parents
            </button>
            <button
              onClick={() => setActiveView('login')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl text-lg border border-white/30 transition-all min-h-[44px]"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center font-bold text-xl mb-4">
            1
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Book in 3 Minutes</h3>
          <p className="text-base text-slate-600">
            Select errand or day packages, parent address, care instructions, and timing directly from your phone.
          </p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center font-bold text-xl mb-4">
            2
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">100% Vetted Helpers</h3>
          <p className="text-base text-slate-600">
            Police verification, driving licence checks, reference interviews, and supervised trial visits before approval.
          </p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center font-bold text-xl mb-4">
            3
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Updates & Photos</h3>
          <p className="text-base text-slate-600">
            Receive check-in alerts, real-time visit photos, prescription updates, and one-tap emergency escalation.
          </p>
        </div>
      </section>

      {/* System Health Status */}
      <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-teal-600" />
          <div>
            <h4 className="font-bold text-slate-900 text-base">Backend API Status</h4>
            <p className="text-sm text-slate-500">
              {health ? `Connected · ${health.service} (${health.version})` : error ? error : 'Connecting...'}
            </p>
          </div>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
        </button>
      </section>
    </div>
  );
}

function MainApp() {
  const [activeView, setActiveView] = useState('home');
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1">
        {activeView === 'home' && <HomeOverview setActiveView={setActiveView} />}
        {activeView === 'login' && (
          <LoginPage
            onNavigateRegister={() => setActiveView('register')}
            onSuccess={() => setActiveView('dashboard')}
          />
        )}
        {activeView === 'register' && (
          <RegisterPage
            onNavigateLogin={() => setActiveView('login')}
            onSuccess={() => setActiveView('dashboard')}
          />
        )}
        {activeView === 'dashboard' && (
          <ProtectedRoute
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <DashboardPage />
          </ProtectedRoute>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm font-semibold text-slate-500">
        DearHand Platform &copy; 2026 · Mysuru Pilot · Handpicked stand-ins for elderly parents
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
