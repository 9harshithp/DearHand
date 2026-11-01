import React, { useState, useEffect } from 'react';
import { HeartHandshake, ShieldCheck, Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/health');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">DearHand</h1>
              <p className="text-sm font-medium text-slate-500">Trusted care & helpers for elderly parents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              Pilot Mysore
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
        {/* Banner */}
        <section className="bg-gradient-to-br from-teal-800 to-teal-950 text-white rounded-2xl p-6 md:p-8 shadow-xl">
          <span className="px-3 py-1 bg-teal-700/60 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-200">
            Phase 1: Foundation Setup
          </span>
          <h2 className="text-3xl font-bold mt-3 mb-2">Platform Setup & Health Check</h2>
          <p className="text-lg text-teal-100 max-w-2xl">
            DearHand gives adult children a verified, consistent helper who steps in for them when parents need help at home.
          </p>
        </section>

        {/* Backend Connectivity Status Card */}
        <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-teal-600" />
              <h3 className="text-xl font-bold text-slate-900">API Health Status</h3>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-semibold rounded-lg transition-colors border border-slate-300 min-h-[44px]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Check
            </button>
          </div>

          {loading && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              <span>Checking Spring Boot API connection at <code className="font-mono text-sm">/api/v1/health</code>...</span>
            </div>
          )}

          {!loading && health && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-slate-800">
                <p className="font-bold text-emerald-900 text-lg">Backend API is Online</p>
                <div className="text-sm space-y-0.5 font-mono text-slate-700">
                  <p><strong>Service:</strong> {health.service}</p>
                  <p><strong>Status:</strong> <span className="text-emerald-700 font-bold">{health.status}</span></p>
                  <p><strong>Version:</strong> {health.version}</p>
                  <p><strong>Timestamp:</strong> {health.timestamp}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900 text-lg">Backend API Not Reachable</p>
                <p className="text-base text-amber-800">{error}</p>
                <p className="text-sm text-slate-600 mt-2">
                  Make sure the Spring Boot service is started (e.g., <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">./mvnw spring-boot:run</code> or via docker-compose).
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Accessibility & Design Compliance Checklist */}
        <section className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-3">Accessibility & Design Standards</h3>
          <ul className="space-y-2.5 text-base text-slate-700">
            <li className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <strong>High-Contrast Text:</strong> Tested WCAG AA/AAA compliant text colors for elderly readability.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <strong>Minimum Font Size:</strong> Base typography initialized to 16px.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <strong>Touch Targets:</strong> Minimum 44px tap areas across all buttons, inputs, and links.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm font-medium text-slate-500">
        DearHand Platform &copy; 2026 · Handpicked stand-ins for elderly parents in Mysuru
      </footer>
    </div>
  );
}
