import React, { useState, useEffect } from 'react';
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
  Plus,
  ArrowRight,
  Clock,
  MapPin
} from 'lucide-react';

export default function DashboardPage({
  onNavigateHelperOnboarding,
  onNavigateAdminVerification,
  onNavigateAdminBookings,
  onNavigateAdminOperations,
  onNavigateNewBooking,
  onNavigateParents,
  onNavigateBookingDetail,
}) {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [roleTestResult, setRoleTestResult] = useState(null);
  const [roleTestLoading, setRoleTestLoading] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoadingBookings(true);
        const data = await apiRequest('/bookings');
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings', err);
      } finally {
        setLoadingBookings(false);
      }
    }

    if (user) {
      loadBookings();
    }
  }, [user]);

  const testEndpoint = async (roleEndpoint) => {
    setRoleTestLoading(true);
    setRoleTestResult(null);
    try {
      const data = await apiRequest(`/test/${roleEndpoint}`);
      setRoleTestResult({ success: true, message: data.message, code: 200, testedRole: roleEndpoint });
    } catch (err) {
      setRoleTestResult({
        success: false,
        message: err.message || 'Access Forbidden',
        code: err.status || 403,
        testedRole: roleEndpoint,
      });
    } finally {
      setRoleTestLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold uppercase">Completed</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-100 text-red-900 border border-red-300 rounded-full text-xs font-bold uppercase">Cancelled</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-bold uppercase animate-pulse">In Progress</span>;
      case 'ACCEPTED':
        return <span className="px-3 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-full text-xs font-bold uppercase">Accepted</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold uppercase">{status}</span>;
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

      {/* FAMILY SECTION */}
      {user?.role === 'FAMILY' && (
        <section className="space-y-6">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/70 border-2 border-teal-200 rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <Calendar className="w-8 h-8 text-teal-700 mb-2" />
                <h3 className="text-2xl font-black text-teal-950">Book a Stand-in Helper</h3>
                <p className="text-base text-teal-800 mt-1">
                  Schedule hospital escort, bank visits, pharmacy pickups, or companionship.
                </p>
              </div>
              <button
                onClick={onNavigateNewBooking}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-2xl min-h-[44px] shadow-sm transition-all"
              >
                <Plus className="w-5 h-5" /> New Booking Request
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 border-2 border-blue-200 rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <Users className="w-8 h-8 text-blue-700 mb-2" />
                <h3 className="text-2xl font-black text-blue-950">Parent Profiles</h3>
                <p className="text-base text-blue-800 mt-1">
                  Manage care instructions, home address in Mysuru, and emergency contacts.
                </p>
              </div>
              <button
                onClick={onNavigateParents}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl min-h-[44px] shadow-sm transition-all"
              >
                View & Edit Parent Profiles &rarr;
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Your Bookings</h3>
                <p className="text-base text-slate-600">Upcoming and past visits for your parents</p>
              </div>
              <button
                onClick={onNavigateNewBooking}
                className="text-teal-700 hover:text-teal-800 font-bold text-base inline-flex items-center gap-1"
              >
                + Request Another
              </button>
            </div>

            {loadingBookings ? (
              <p className="text-base text-slate-500 py-4 text-center">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">No bookings requested yet</h4>
                <p className="text-base text-slate-500 max-w-sm mx-auto">
                  Ready to book a verified stand-in helper for your parents in Mysuru?
                </p>
                <button
                  onClick={onNavigateNewBooking}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base min-h-[44px]"
                >
                  Create First Booking
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onNavigateBookingDetail && onNavigateBookingDetail(b.id)}
                    className="p-5 bg-slate-50 hover:bg-teal-50/40 border-2 border-slate-200 hover:border-teal-400 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 text-lg">
                          Booking #{b.id}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="text-base font-bold text-slate-800">
                        {b.parent?.name} · {b.carePackage?.name}
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(b.scheduledStart).toLocaleDateString()} at {new Date(b.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-slate-500">
                        Address: {b.address}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                      <span className="text-2xl font-black text-teal-900">₹{b.totalAmount}</span>
                      <span className="text-sm font-bold text-teal-700 inline-flex items-center gap-1">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* HELPER SECTION */}
      {user?.role === 'HELPER' && (
        <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Helper Portal</h3>
              <p className="text-base text-slate-600">Your profile and document verification pipeline</p>
            </div>
            <span className="px-4 py-1.5 rounded-full text-base font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {user?.helperStatus || 'APPLIED'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-700 space-y-3">
            <p>
              <strong>Status:</strong> {user?.helperStatus === 'APPROVED' ? 'You are approved and bookable!' : 'Verification in progress.'}
            </p>
            <button
              onClick={onNavigateHelperOnboarding}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base min-h-[44px] transition-colors"
            >
              Complete Application & Manage Documents &rarr;
            </button>
          </div>

          {/* Assigned Bookings for Helper */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xl font-bold text-slate-900 mb-3">Your Assigned Visits</h4>
            {loadingBookings ? (
              <p className="text-base text-slate-500">Loading visits...</p>
            ) : bookings.length === 0 ? (
              <p className="text-base text-slate-500 italic">No visits assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onNavigateBookingDetail && onNavigateBookingDetail(b.id)}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-teal-400 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Booking #{b.id} · {b.parent?.name}</p>
                      <p className="text-sm text-slate-600">{b.address}</p>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ADMIN SECTION */}
      {user?.role === 'ADMIN' && (
        <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Operations & Admin Center</h3>
              <p className="text-base text-slate-600">
                Manage helper applications, verify original documents, and assign bookings to helpers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onNavigateAdminOperations}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-base min-h-[44px] shadow-sm transition-colors"
              >
                Safety & Operations Desk &rarr;
              </button>
              <button
                onClick={onNavigateAdminBookings}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base min-h-[44px] shadow-sm transition-colors"
              >
                Matching & Bookings Board &rarr;
              </button>
              <button
                onClick={onNavigateAdminVerification}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-base min-h-[44px] transition-colors"
              >
                Helper Verification &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div
              onClick={onNavigateAdminOperations}
              className="p-5 bg-red-50 border-2 border-red-200 hover:border-red-500 rounded-2xl cursor-pointer transition-all"
            >
              <p className="font-bold text-red-900 text-lg">Safety & Pricing Desk</p>
              <p className="text-sm text-red-800 font-semibold mt-1">Incidents & Packages</p>
              <p className="text-sm text-red-700 mt-1">Manage safety alerts, package prices & audit trail &rarr;</p>
            </div>
            <div
              onClick={onNavigateAdminBookings}
              className="p-5 bg-teal-50 border-2 border-teal-200 hover:border-teal-500 rounded-2xl cursor-pointer transition-all"
            >
              <p className="font-bold text-teal-900 text-lg">Matching Board</p>
              <p className="text-2xl font-black text-teal-950 mt-1">{bookings.length} Bookings</p>
              <p className="text-sm text-teal-700 mt-1">Assign bookings to available approved helpers &rarr;</p>
            </div>
            <div
              onClick={onNavigateAdminVerification}
              className="p-5 bg-purple-50 border-2 border-purple-200 hover:border-purple-500 rounded-2xl cursor-pointer transition-all"
            >
              <p className="font-bold text-purple-900 text-lg">Helper Verification</p>
              <p className="text-sm text-purple-700 mt-1">Review licenses and background checks &rarr;</p>
            </div>
          </div>
        </section>
      )}

      {/* Live Role-Based Access Control Test Widget */}
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

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-700">
            Current Account Role: <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg uppercase text-xs tracking-wider">{user?.role}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => testEndpoint('family')}
            disabled={roleTestLoading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl min-h-[44px] transition-colors shadow-sm"
          >
            Test /test/family (Needs FAMILY)
          </button>
          <button
            onClick={() => testEndpoint('helper')}
            disabled={roleTestLoading}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl min-h-[44px] transition-colors shadow-sm"
          >
            Test /test/helper (Needs HELPER)
          </button>
          <button
            onClick={() => testEndpoint('admin')}
            disabled={roleTestLoading}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-base rounded-xl min-h-[44px] transition-colors shadow-sm"
          >
            Test /test/admin (Needs ADMIN)
          </button>
        </div>

        {roleTestLoading && (
          <p className="text-base text-slate-600 animate-pulse font-medium">Contacting Spring Boot security filter...</p>
        )}

        {roleTestResult && (
          <div
            className={`p-5 rounded-2xl border-2 flex items-start gap-4 ${
              roleTestResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            {roleTestResult.success ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="text-lg font-black">
                {roleTestResult.success
                  ? `HTTP 200 Success — Access Granted`
                  : `HTTP 403 Forbidden — Expected Security Segregation`}
              </p>
              <p className="text-base font-semibold">{roleTestResult.message}</p>
              <p className="text-sm text-slate-700 pt-1">
                {roleTestResult.success ? (
                  <span>
                    Your current active role (<strong>{user?.role}</strong>) satisfies the Spring Boot requirement for this endpoint.
                  </span>
                ) : (
                  <span>
                    This endpoint requires role <strong>{roleTestResult.testedRole?.toUpperCase()}</strong>, but you are signed in as <strong>{user?.role}</strong>. Spring Security's <code className="bg-white/80 px-1.5 py-0.5 rounded text-xs">@PreAuthorize</code> strictly blocked access to prevent unauthorized role escalation.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
