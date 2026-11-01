import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Phone,
  CreditCard,
  Ban
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import PaymentReceiptModal from '../components/PaymentReceiptModal';

export default function BookingDetailPage({ bookingId, onBack, onNavigatePayment }) {
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [respondingToMatch, setRespondingToMatch] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/bookings/${bookingId}`);
      setBooking(data);
    } catch (err) {
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    setCancelling(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await apiRequest(`/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason }),
      });
      setBooking(updated);
      setMessage('Booking has been cancelled.');
      setShowCancelModal(false);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleAcceptAssignment = async () => {
    setRespondingToMatch(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await apiRequest(`/bookings/${bookingId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ accept: true }),
      });
      setBooking(updated);
      setMessage('You have accepted this visit! Family has been notified to complete payment.');
    } catch (err) {
      setError(err.message || 'Failed to accept assignment');
    } finally {
      setRespondingToMatch(false);
    }
  };

  const handleDeclineAssignment = async (e) => {
    e.preventDefault();
    setRespondingToMatch(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await apiRequest(`/bookings/${bookingId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ accept: false, reason: declineReason }),
      });
      setBooking(updated);
      setShowDeclineModal(false);
      setMessage('You have declined this visit assignment. The booking has been returned to the admin queue.');
    } catch (err) {
      setError(err.message || 'Failed to decline assignment');
    } finally {
      setRespondingToMatch(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-base font-bold text-slate-700">Loading booking #{bookingId}...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border-2 border-red-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-2xl font-bold text-slate-900">Unable to load booking</h3>
        <p className="text-base text-slate-600">{error || 'Booking not found.'}</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl min-h-[44px]"
        >
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  const steps = ['REQUESTED', 'MATCHED', 'ACCEPTED', 'PAID', 'IN_PROGRESS', 'COMPLETED'];
  const currentStepIdx = steps.indexOf(booking.status);
  const isCancelled = booking.status === 'CANCELLED';
  const canCancel = ['REQUESTED', 'MATCHED', 'ACCEPTED', 'PAID'].includes(booking.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Navigation */}
      <div>
        <button
          onClick={onBack}
          className="text-teal-700 hover:text-teal-800 font-bold text-base mb-2 inline-flex items-center gap-1 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Bookings
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Booking #{booking.id}
            </h2>
            <p className="text-base text-slate-600">
              {booking.carePackage?.name} · Scheduled for {new Date(booking.scheduledStart).toLocaleDateString()} at {new Date(booking.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-base font-extrabold uppercase tracking-wide border ${
                booking.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : booking.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : booking.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {booking.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-base text-emerald-900 font-bold">{message}</p>
        </div>
      )}

      {/* Booking State Machine Visual Pipeline */}
      {!isCancelled && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Live Booking Progress Flow
          </h4>
          <div className="flex items-center justify-between min-w-[500px] gap-2">
            {steps.map((step, idx) => {
              const isPast = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step} className="flex-1 flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-1.5 transition-colors ${
                      isPast
                        ? 'bg-teal-600 text-white'
                        : isCurrent
                        ? 'bg-teal-100 text-teal-900 border-2 border-teal-600 ring-2 ring-teal-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-tight ${
                      isCurrent ? 'text-teal-950 font-black' : isPast ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helper Assignment Action Banner */}
      {user?.role === 'HELPER' && booking.status === 'MATCHED' && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-500 rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-md">
                Action Required
              </span>
              <h3 className="text-2xl font-black text-slate-900 pt-1">
                New Visit Assignment Matched to You!
              </h3>
              <p className="text-base text-slate-700 leading-relaxed">
                DearHand operations has matched you for this visit to assist <strong>{booking.parent?.name}</strong> on {new Date(booking.scheduledStart).toLocaleDateString()} at {new Date(booking.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleAcceptAssignment}
              disabled={respondingToMatch}
              className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg rounded-2xl min-h-[48px] shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {respondingToMatch ? 'Confirming...' : 'Accept Visit Assignment'}
            </button>

            <button
              onClick={() => setShowDeclineModal(true)}
              disabled={respondingToMatch}
              className="px-6 py-3.5 bg-white hover:bg-red-50 text-red-700 border-2 border-red-300 font-bold text-lg rounded-2xl min-h-[48px] transition-all flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Decline Assignment
            </button>
          </div>
        </div>
      )}

      {/* Family Notification Banner: Matched */}
      {user?.role === 'FAMILY' && booking.status === 'MATCHED' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 flex items-start gap-3">
          <Clock className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xl font-bold text-slate-900">Helper Matched & Awaiting Acceptance</h4>
            <p className="text-base text-slate-700 mt-1">
              We have matched <strong>{booking.helper?.name}</strong> to your request. The helper has been notified via WhatsApp and will confirm shortly. Once confirmed, you can proceed to payment.
            </p>
          </div>
        </div>
      )}

      {/* Family Notification Banner: Accepted and Ready for Payment */}
      {user?.role === 'FAMILY' && booking.status === 'ACCEPTED' && booking.paymentStatus === 'PENDING' && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xl font-bold text-emerald-950">Visit Accepted by {booking.helper?.name}!</h4>
              <p className="text-base text-emerald-900 mt-1">
                Your stand-in helper has confirmed the schedule. Please complete payment of ₹{booking.totalAmount} to finalize the visit.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base rounded-2xl min-h-[48px] shadow-md whitespace-nowrap"
          >
            Proceed to Pay ₹{booking.totalAmount} &rarr;
          </button>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parent Details Card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" /> Parent to Assist
          </h3>
          <div className="text-base text-slate-800 space-y-1">
            <p className="text-2xl font-black text-slate-900">{booking.parent?.name}</p>
            <p>Age: {booking.parent?.age} years · Language: {booking.parent?.language}</p>
            <p className="flex items-start gap-1.5 pt-1 text-slate-700">
              <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>{booking.address}</span>
            </p>
            {booking.parent?.careNotes && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
                <strong>Care Instructions:</strong> {booking.parent.careNotes}
              </div>
            )}
            <p className="text-sm text-slate-500 pt-2">
              Emergency Contact: {booking.parent?.emergencyContactName} ({booking.parent?.emergencyContactPhone})
            </p>
          </div>
        </div>

        {/* Assigned Helper Card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" /> Assigned Stand-in Helper
          </h3>
          {booking.helper ? (
            <div className="text-base text-slate-800 space-y-1.5">
              <p className="text-2xl font-black text-slate-900">{booking.helper.name}</p>
              <p className="text-sm font-semibold text-emerald-800">
                ⭐ {booking.helper.ratingAvg?.toFixed(1) || '5.0'} / 5.0 Rating · {booking.helper.yearsExperience} yrs experience
              </p>
              <p className="text-sm text-slate-600">Languages: {booking.helper.languages}</p>
              <p className="text-sm text-slate-600">Vehicle: {booking.helper.vehicleType || 'Personal Car'}</p>
              <p className="text-sm text-slate-600 flex items-center gap-1.5 pt-1">
                <Phone className="w-4 h-4 text-slate-400" /> Phone: {booking.helper.phone}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <p className="font-bold text-slate-700">Helper Matching in Progress</p>
              <p className="text-sm text-slate-500">
                DearHand operations matches a verified helper in Mysuru within 30 minutes of request.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Notes Card */}
      {booking.taskNotes && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
          <h3 className="text-lg font-bold text-slate-900">Task Instructions for Visit</h3>
          <p className="text-base text-slate-700 whitespace-pre-wrap">{booking.taskNotes}</p>
        </div>
      )}

      {/* Pricing and Cancellation Footer */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Total Price</span>
          <p className="text-3xl font-black text-slate-900">₹{booking.totalAmount}</p>
          <p className="text-xs text-slate-500">
            Payment Status: <span className="font-bold uppercase text-slate-700">{booking.paymentStatus}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold text-base rounded-xl min-h-[44px] transition-colors"
            >
              Cancel Booking
            </button>
          )}

          {booking.status === 'ACCEPTED' && booking.paymentStatus === 'PENDING' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl min-h-[44px] shadow transition-colors flex items-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pay ₹{booking.totalAmount} (Razorpay) &rarr;
            </button>
          )}

          {booking.paymentStatus === 'SUCCESS' && (
            <button
              onClick={() => setShowReceiptModal(true)}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base rounded-xl min-h-[44px] border border-slate-300 transition-colors flex items-center gap-2"
            >
              <FileText className="w-5 h-5 text-teal-600" />
              View Official Receipt
            </button>
          )}
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-700">
              <Ban className="w-7 h-7" />
              <h3 className="text-2xl font-bold">Cancel This Booking?</h3>
            </div>
            <p className="text-base text-slate-600">
              Please share a reason for cancellation so our Mysuru operations team can update the helper.
            </p>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, parent doctor rescheduled"
              className="w-full px-4 py-2.5 text-base border-2 border-slate-300 rounded-xl focus:border-red-600 focus:outline-none"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl min-h-[44px]"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl min-h-[44px]"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper Decline Assignment Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-700">
              <XCircle className="w-7 h-7" />
              <h3 className="text-2xl font-bold">Decline Assignment</h3>
            </div>
            <p className="text-base text-slate-600">
              Please share a reason so our Mysuru operations coordinator can quickly re-assign another stand-in helper for this parent.
            </p>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Prior scheduling conflict, out of Mysuru"
              className="w-full px-4 py-2.5 text-base border-2 border-slate-300 rounded-xl focus:border-red-600 focus:outline-none"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeclineAssignment}
                disabled={respondingToMatch}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl min-h-[44px]"
              >
                {respondingToMatch ? 'Declining...' : 'Confirm Decline'}
              </button>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl min-h-[44px]"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          booking={booking}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updatedBooking) => {
            setShowPaymentModal(false);
            if (updatedBooking) {
              setBooking(updatedBooking);
            }
            setMessage(`Payment confirmed! ₹${booking.totalAmount} paid via Razorpay. Your verified helper is confirmed.`);
            setShowReceiptModal(true);
          }}
        />
      )}

      {/* Payment Receipt Modal */}
      {showReceiptModal && (
        <PaymentReceiptModal
          bookingId={booking.id}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
