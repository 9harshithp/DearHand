import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, KeyRound, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage({ onNavigateRegister, onSuccess }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Demo credential helper for quick testing
  const fillCredentials = (username, pass) => {
    setIdentifier(username);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 px-4">
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
          <p className="text-base text-slate-600 mt-1">
            Access your family bookings or helper portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-base text-red-800 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5" htmlFor="login-identifier">
              Email or Phone Number
            </label>
            <div className="relative">
              <input
                id="login-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. rohan.rao@example.com or +919880011223"
                className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none transition-colors min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1.5" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none transition-colors min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-md transition-colors text-lg disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to DearHand'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-base text-slate-600">
            Don't have an account yet?{' '}
            <button
              onClick={onNavigateRegister}
              className="font-bold text-teal-700 hover:text-teal-800 underline underline-offset-4 min-h-[44px]"
            >
              Sign up here
            </button>
          </p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
            Test Accounts (from V2 migration)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@dearhand.in', 'Admin@123')}
              className="px-2.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-sm font-semibold min-h-[44px]"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('rohan.rao@example.com', 'Family@123')}
              className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-sm font-semibold min-h-[44px]"
            >
              Family
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('suresh.mysuru@example.com', 'Helper@123')}
              className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-sm font-semibold min-h-[44px]"
            >
              Helper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
