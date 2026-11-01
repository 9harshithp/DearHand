import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import {
  HeartHandshake,
  ShieldCheck,
  User,
  LogOut,
  Calendar,
  Users,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles
} from 'lucide-react';

export default function DashboardPage({ onNavigateHelperOnboarding, onNavigateAdminVerification }) {
  const { user, logout } = useAuth();
  const [roleTestResult, setRoleTestResult] = useState(null);
  const [roleTestLoading, setRoleTestLoading] = useState(false);

  const testEndpoint = async (roleEndpoint) => {
    setRoleTestLoading(true);
    setRoleTestResult(null);
    try {
      const data = await apiRequest(`/test/${roleEndpoint}`);
      setRoleTestResult({ success: true, message: data.message, code: 200 });
    } catch (err) {
      setRoleTestResult({
        success: false,
        message: err.message || 'Access Forbidden',
        code: err.status || 403,
      });
    } finally {
      setRoleTestLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name}!
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : user?.role === 'HELPER'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}
            >
              {user?.role} Account
            </span>
          </div>
          <p className="text-base text-slate-600">
            {user?.email} · {user?.phone}
          </p>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base rounded-xl border border-slate-300 min-h-[44px] transition-colors self-start md:self-auto"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </section>

      {/* Role Specific Section */}
      {user?.role === 'FAMILY' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-2xl p-6">
              <Users className="w-8 h-8 text-teal-700 mb-2" />
              <h3 className="text-xl font-bold text-teal-950">Parent Profiles</h3>
              <p className="text-base text-teal-800 mt-1 mb-4">
                Manage care notes, home addresses, and emergency contacts.
              </p>
              <span className="text-sm font-semibold text-teal-900 bg-teal-200/60 px-3 py-1 rounded-full">
                Phase 5 Ready
              </span>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
              <Calendar className="w-8 h-8 text-blue-700 mb-2" />
              <h3 className="text-xl font-bold text-blue-950">Book a Helper</h3>
              <p className="text-base text-blue-800 mt-1 mb-4">
                Schedule a vetted stand-in for hospital trips, bank work, or errands.
              </p>
              <span className="text-sm font-semibold text-blue-900 bg-blue-200/60 px-3 py-1 rounded-full">
                Packages: Task, Half Day, Full Day
              </span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-6">
              <ShieldCheck className="w-8 h-8 text-amber-700 mb-2" />
              <h3 className="text-xl font-bold text-amber-950">Mysuru Pilot Safety</h3>
              <p className="text-base text-amber-800 mt-1 mb-4">
                Every helper undergoes police verification and reference interviews.
              </p>
              <span className="text-sm font-semibold text-amber-900 bg-amber-200/60 px-3 py-1 rounded-full">
                100% Vetted
              </span>
            </div>
          </div>
        </section>
      )}

      {user?.role === 'HELPER' && (
        <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Helper Application Status</h3>
              <p className="text-base text-slate-600">Your profile and document verification pipeline</p>
            </div>
            <span className="px-4 py-1.5 rounded-full text-base font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {user?.helperStatus || 'APPLIED'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-700 space-y-2">
            <p>
              <strong>Next Step:</strong> Upload your Government ID, Driving Licence, and Police Verification Certificate.
            </p>
            <p className="text-sm text-slate-500">
              Once approved by the admin team, you will start receiving visit requests from families in Mysuru.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateHelperOnboarding}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base min-h-[44px] transition-colors"
              >
                Complete Application & Upload Documents &rarr;
              </button>
            </div>
          </div>
        </section>
      )}

      {user?.role === 'ADMIN' && (
        <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Operations & Admin Center</h3>
              <p className="text-base text-slate-600">
                Manage helper applications, verify original documents, and assign bookings to helpers.
              </p>
            </div>
            <button
              onClick={onNavigateAdminVerification}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-base min-h-[44px] transition-colors"
            >
              Open Helper Verification Console &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="font-bold text-purple-900 text-lg">Helper Approvals</p>
              <p className="text-sm text-purple-700">Verify ID, licence & reference calls</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="font-bold text-purple-900 text-lg">Matching Board</p>
              <p className="text-sm text-purple-700">Assign bookings to available helpers</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="font-bold text-purple-900 text-lg">Audit Logs</p>
              <p className="text-sm text-purple-700">Track all sensitive actions</p>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Live Role-Guard Security Tester */}
      <section className="bg-white border-2 border-slate-300 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <Lock className="w-7 h-7 text-teal-600" />
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Live Role-Based Access Control Test</h3>
            <p className="text-base text-slate-600">
              Test role ownership by pinging protected Spring Boot endpoints with your current JWT
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => testEndpoint('family')}
            disabled={roleTestLoading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl min-h-[44px] transition-colors"
          >
            Test /test/family (Needs FAMILY)
          </button>
          <button
            onClick={() => testEndpoint('helper')}
            disabled={roleTestLoading}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl min-h-[44px] transition-colors"
          >
            Test /test/helper (Needs HELPER)
          </button>
          <button
            onClick={() => testEndpoint('admin')}
            disabled={roleTestLoading}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-base rounded-xl min-h-[44px] transition-colors"
          >
            Test /test/admin (Needs ADMIN)
          </button>
        </div>

        {roleTestLoading && (
          <p className="text-base text-slate-600">Checking endpoint permission...</p>
        )}

        {roleTestResult && (
          <div
            className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
              roleTestResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            {roleTestResult.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-lg font-bold">
                HTTP {roleTestResult.code} {roleTestResult.success ? 'Success' : 'Forbidden'}
              </p>
              <p className="text-base mt-0.5">{roleTestResult.message}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
