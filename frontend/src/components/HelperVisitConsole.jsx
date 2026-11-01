import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import {
  Play,
  CheckCircle2,
  Camera,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';

export default function HelperVisitConsole({ booking, onBookingUpdated, onOpenEmergency }) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [updatingLog, setUpdatingLog] = useState(false);
  const [visitNotes, setVisitNotes] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      setErrorMsg(null);
      const updated = await apiRequest(`/bookings/${booking.id}/checkin`, {
        method: 'POST',
      });
      setFeedbackMsg('Checked in! Visit is now IN PROGRESS. Family has been notified.');
      onBookingUpdated(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleUpdateLog = async (e) => {
    e.preventDefault();
    if (!visitNotes.trim() && !selectedPhoto) {
      setErrorMsg('Please enter a note or select a photo to log.');
      return;
    }

    try {
      setUpdatingLog(true);
      setErrorMsg(null);

      let updated;
      if (selectedPhoto) {
        const formData = new FormData();
        if (visitNotes.trim()) formData.append('notes', visitNotes.trim());
        formData.append('photo', selectedPhoto);

        // Upload using raw fetch to handle multipart with Bearer auth token
        const token = localStorage.getItem('dearhand_jwt');
        const res = await fetch(`/api/v1/bookings/${booking.id}/update`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Upload failed (HTTP ${res.status})`);
        }
        updated = await res.json();
      } else {
        updated = await apiRequest(`/bookings/${booking.id}/update`, {
          method: 'POST',
          body: JSON.stringify({ notes: visitNotes.trim() }),
        });
      }

      setVisitNotes('');
      setSelectedPhoto(null);
      setFeedbackMsg('Visit update and photo logged successfully!');
      onBookingUpdated(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update visit log');
    } finally {
      setUpdatingLog(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      setErrorMsg(null);
      const updated = await apiRequest(`/bookings/${booking.id}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ notes: checkoutNotes.trim() }),
      });
      setShowCheckoutConfirm(false);
      setFeedbackMsg('Visit completed and checked out! Family notified to review.');
      onBookingUpdated(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Helper Visit Controls
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              Current Visit Status: <span className="font-extrabold uppercase text-teal-800">{booking.status.replace('_', ' ')}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenEmergency}
          className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 border-2 border-red-300 font-bold text-sm rounded-xl min-h-[44px] flex items-center gap-1.5 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-red-600" /> Emergency SOS
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 font-bold">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <p>{feedbackMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center gap-3 text-red-900 font-bold">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* STATE 1: PAID -> Prompt Check-in */}
      {booking.status === 'PAID' && (
        <div className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-400 rounded-2xl space-y-4 text-center">
          <Clock className="w-12 h-12 text-teal-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-slate-900">
              Ready to Start Visit?
            </h4>
            <p className="text-base text-slate-700 max-w-md mx-auto">
              Please tap below when you have arrived at <strong>{booking.parent?.name}</strong>'s home in {booking.parent?.city || 'Mysuru'}.
            </p>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg rounded-2xl min-h-[50px] shadow-lg transition-all inline-flex items-center gap-2"
          >
            {checkingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Checking in...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" /> Check In & Begin Visit
              </>
            )}
          </button>
        </div>
      )}

      {/* STATE 2: IN_PROGRESS -> Live Log & Checkout */}
      {booking.status === 'IN_PROGRESS' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 bg-blue-600 rounded-full animate-ping"></span>
              <p className="text-base font-bold text-blue-950">
                Care Visit in Progress · Checked in at{' '}
                {booking.checkinAt ? new Date(booking.checkinAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </p>
            </div>
          </div>

          {/* Log Note & Photo Form */}
          <form onSubmit={handleUpdateLog} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" /> Log Visit Note or Photo
            </h4>

            <textarea
              rows={2}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder="e.g. Accompanied parent to Dr. Rao's clinic. Vital signs stable, next checkup in 2 weeks."
              className="w-full px-4 py-2.5 text-base border-2 border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-700 font-bold text-sm min-h-[44px]">
                <Camera className="w-5 h-5 text-teal-600" />
                <span>{selectedPhoto ? selectedPhoto.name : 'Attach Photo / Prescription'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedPhoto(e.target.files[0] || null)}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={updatingLog || (!visitNotes.trim() && !selectedPhoto)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl min-h-[44px] shadow-sm disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                {updatingLog ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                Log Update
              </button>
            </div>
          </form>

          {/* Checkout Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-900 text-base">Finished with all scheduled tasks?</p>
              <p className="text-sm text-slate-500">Completing visit sends final summary and triggers family review</p>
            </div>

            <button
              type="button"
              onClick={() => setShowCheckoutConfirm(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base rounded-2xl min-h-[48px] shadow transition-colors"
            >
              Complete Visit & Checkout &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Dialog */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl">
            <h4 className="text-2xl font-black text-slate-900">
              Confirm Visit Completion
            </h4>
            <p className="text-base text-slate-600">
              Please share a quick closing summary for <strong>{booking.parent?.name}</strong>'s family before ending the visit.
            </p>
            <textarea
              rows={3}
              value={checkoutNotes}
              onChange={(e) => setCheckoutNotes(e.target.value)}
              placeholder="e.g. All errands finished, parent settled comfortably at home."
              className="w-full px-4 py-2.5 text-base border-2 border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl min-h-[44px]"
              >
                {checkingOut ? 'Checking out...' : 'Confirm Checkout'}
              </button>
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl min-h-[44px]"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
