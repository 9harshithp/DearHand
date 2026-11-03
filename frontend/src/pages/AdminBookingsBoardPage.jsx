import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import {
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Search,
  Filter,
  X
} from 'lucide-react';

export default function AdminBookingsBoardPage({ onBackToDashboard, onNavigateBookingDetail }) {
  const [board, setBoard] = useState(null);
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningBooking, setAssigningBooking] = useState(null);
  const [selectedHelperId, setSelectedHelperId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [activeTab, setActiveTab] = useState('unassigned');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [boardData, approvedHelpers] = await Promise.all([
        apiRequest('/admin/bookings/board'),
        apiRequest('/admin/helpers?status=APPROVED'),
      ]);
      setBoard(boardData);
      setHelpers(approvedHelpers || []);
    } catch (err) {
      setError(err.message || 'Failed to load booking operations board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, []);

  const handleOpenAssignModal = (booking) => {
    setAssigningBooking(booking);
    setSelectedHelperId('');
    setError(null);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHelperId) {
      setError('Please select an approved helper to assign.');
      return;
    }

    try {
      setSubmittingAssign(true);
      setError(null);
      await apiRequest(`/admin/bookings/${assigningBooking.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ helperId: Number(selectedHelperId) }),
      });
      setMessage(`Helper successfully assigned to Booking #${assigningBooking.id}!`);
      setAssigningBooking(null);
      await fetchBoardData();
    } catch (err) {
      setError(err.message || 'Failed to assign helper');
    } finally {
      setSubmittingAssign(false);
    }
  };

  if (loading && !board) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-bold text-slate-700">Loading Mysuru Operations Board...</p>
      </div>
    );
  }

  const queues = [
    {
      id: 'unassigned',
      label: 'Unassigned Queue',
      count: board?.unassignedQueue?.length || 0,
      items: board?.unassignedQueue || [],
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      actionText: 'Assign Helper',
    },
    {
      id: 'awaiting',
      label: 'Awaiting Acceptance',
      count: board?.awaitingAcceptance?.length || 0,
      items: board?.awaitingAcceptance || [],
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: 'accepted',
      label: 'Accepted / Awaiting Payment',
      count: board?.acceptedAndPendingPayment?.length || 0,
      items: board?.acceptedAndPendingPayment || [],
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      id: 'paid',
      label: 'Paid & In Progress',
      count: (board?.paidAndReady?.length || 0) + (board?.inProgress?.length || 0),
      items: [...(board?.paidAndReady || []), ...(board?.inProgress || [])],
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      id: 'archive',
      label: 'Completed & Cancelled',
      count: (board?.completed?.length || 0) + (board?.cancelled?.length || 0),
      items: [...(board?.completed || []), ...(board?.cancelled || [])],
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    },
  ];

  const currentQueue = queues.find((q) => q.id === activeTab) || queues[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-teal-700 hover:text-teal-800 font-bold text-base mb-2 inline-flex items-center gap-1 min-h-[44px]"
          >
            &larr; Back to Dashboard
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Matching & Operations Board
          </h2>
          <p className="text-base text-slate-600">
            Mysuru Pilot: Match vetted local helpers to senior bookings in under 30 minutes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBoardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl min-h-[44px] shadow-sm transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <p className="text-base font-bold text-emerald-900">{message}</p>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-base font-bold text-red-900">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Queue Tabs with Live Counts */}
      <div className="flex gap-2 border-b-2 border-slate-200 overflow-x-auto pb-1">
        {queues.map((q) => (
          <button
            key={q.id}
            onClick={() => setActiveTab(q.id)}
            className={`px-5 py-3 font-bold text-base whitespace-nowrap rounded-t-2xl flex items-center gap-2 transition-all min-h-[48px] ${
              activeTab === q.id
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {q.label}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                activeTab === q.id
                  ? 'bg-white text-teal-800'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {q.count}
            </span>
          </button>
        ))}
      </div>

      {/* Current Queue Cards */}
      <div className="space-y-4">
        {currentQueue.items.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">Queue is clear!</h3>
            <p className="text-base text-slate-500">
              There are no bookings currently in {currentQueue.label.toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQueue.items.map((b) => (
              <div
                key={b.id}
                className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                        Booking #{b.id}
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 mt-1">
                        {b.parent?.name}
                      </h4>
                      <p className="text-sm font-semibold text-slate-500">
                        Booked by {b.familyName} ({b.familyPhone || 'HelpSeeker'})
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${currentQueue.badgeColor}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Visit & Package Details */}
                  <div className="space-y-1.5 text-base text-slate-700">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-600" />
                      {b.carePackage?.name} · ₹{b.totalAmount}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(b.scheduledStart).toLocaleDateString()} at{' '}
                      {new Date(b.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="flex items-start gap-1.5 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{b.address}</span>
                    </p>
                  </div>

                  {/* Helper Assignment Status */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm">
                    {b.helper ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">
                            Assigned Helper: {b.helper.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            📞 {b.helper.phone} · ⭐ {b.helper.ratingAvg?.toFixed(1) || '5.0'}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                          {b.status === 'MATCHED' ? 'Awaiting Accept' : 'Accepted'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-amber-800 font-bold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-600" /> No helper assigned yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onNavigateBookingDetail(b.id)}
                    className="text-teal-700 hover:text-teal-800 font-bold text-base inline-flex items-center gap-1 min-h-[44px]"
                  >
                    View Details &rarr;
                  </button>

                  {b.status === 'REQUESTED' && (
                    <button
                      onClick={() => handleOpenAssignModal(b)}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl min-h-[44px] shadow-sm transition-colors inline-flex items-center gap-2"
                    >
                      <UserCheck className="w-5 h-5" />
                      Assign Helper
                    </button>
                  )}

                  {b.status === 'MATCHED' && (
                    <button
                      onClick={() => handleOpenAssignModal(b)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl min-h-[44px] transition-colors"
                    >
                      Re-assign Helper
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helper Assignment Modal */}
      {assigningBooking && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Assign Stand-in Helper
                </h3>
                <p className="text-base text-slate-600">
                  Booking #{assigningBooking.id} for {assigningBooking.parent?.name}
                </p>
              </div>
              <button
                onClick={() => setAssigningBooking(null)}
                className="p-2 text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <label className="block text-base font-bold text-slate-900">
                Choose Approved Mysuru Helper ({helpers.length} available)
              </label>

              {helpers.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-sm">
                  No helpers with status <strong>APPROVED</strong> found. Please approve applicant helpers first in the Helper Verification tab.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {helpers.map((h) => (
                    <label
                      key={h.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        Number(selectedHelperId) === h.id
                          ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-200'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="helperSelect"
                        value={h.id}
                        checked={Number(selectedHelperId) === h.id}
                        onChange={(e) => setSelectedHelperId(e.target.value)}
                        className="w-5 h-5 mt-1 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-slate-900">{h.name}</p>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            ⭐ {h.ratingAvg?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          📞 {h.phone} · {h.yearsExperience || 1} yrs exp · Vehicle: {h.vehicleType || 'Two-wheeler'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Languages: {h.languages || 'Kannada'} · Skills: {h.skills || 'Elderly Care'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={submittingAssign || helpers.length === 0}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-xl min-h-[44px] shadow-sm disabled:opacity-50 transition-colors"
                >
                  {submittingAssign ? 'Assigning...' : 'Confirm Assignment & Notify Helper'}
                </button>
                <button
                  type="button"
                  onClick={() => setAssigningBooking(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
