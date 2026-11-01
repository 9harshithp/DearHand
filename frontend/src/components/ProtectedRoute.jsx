import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children, onNavigateLogin, onNavigateDashboard }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-base font-semibold text-slate-700">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-center">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h2>
        <p className="text-base text-slate-600 mb-6">
          Please log in to your DearHand account to access this section.
        </p>
        <button
          onClick={onNavigateLogin}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          Go to Login
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white border-2 border-red-200 rounded-2xl shadow-sm text-center">
        <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied (403)</h2>
        <p className="text-base text-slate-700 mb-4">
          Your account has role <span className="font-bold uppercase text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{user.role}</span>. This page requires one of the following permissions:
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {allowedRoles.map((role) => (
            <span key={role} className="px-3 py-1 bg-red-50 text-red-800 font-semibold text-sm rounded-lg border border-red-200 uppercase">
              {role}
            </span>
          ))}
        </div>
        <button
          onClick={onNavigateDashboard}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl min-h-[44px] shadow transition-colors"
        >
          Back to My Dashboard
        </button>
      </div>
    );
  }

  return children;
}
