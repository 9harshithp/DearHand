import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import {
  FileText,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export default function PaymentReceiptModal({ bookingId, onClose }) {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReceipt() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest(`/bookings/${bookingId}/receipt`);
        setReceipt(data);
      } catch (err) {
        setError(err.message || 'Failed to load payment receipt');
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      loadReceipt();
    }
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 border-2 border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 print:hidden">
          <div className="flex items-center gap-2 text-teal-800">
            <FileText className="w-6 h-6" />
            <h3 className="text-2xl font-black text-slate-900">Payment Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl min-h-[44px] transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-base font-bold text-slate-700">Generating Official Receipt...</p>
          </div>
        ) : error || !receipt ? (
          <div className="p-6 bg-red-50 border-2 border-red-300 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <p className="text-base font-bold text-red-900">{error || 'Receipt not available'}</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6 print:space-y-4">
            {/* Brand Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">DearHand</h4>
                  <p className="text-xs font-bold text-teal-700 uppercase">Mysuru Stand-in Care</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-black text-xs uppercase tracking-wider rounded-full border border-emerald-300">
                  Paid & Confirmed
                </span>
                <p className="text-xs text-slate-500 font-mono mt-1">{receipt.receiptNumber}</p>
              </div>
            </div>

            {/* Senior and Visit Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500">Parent / Care Recipient</span>
                <p className="font-bold text-slate-900 text-base">{receipt.parentName}</p>
                <p className="text-xs text-slate-600">{receipt.parentAddress}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500">Assigned Stand-in Helper</span>
                <p className="font-bold text-slate-900 text-base">{receipt.helperName}</p>
                <p className="text-xs text-slate-600">📞 {receipt.helperPhone || 'Verified Helper'}</p>
              </div>
            </div>

            {/* Package & Schedule Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-600 grid grid-cols-3">
                <span className="col-span-2">Service Description</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="p-4 grid grid-cols-3 text-sm border-b border-slate-100 items-center">
                <div className="col-span-2 space-y-0.5">
                  <p className="font-bold text-slate-900">{receipt.packageName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(receipt.scheduledStart).toLocaleDateString()} at{' '}
                    {new Date(receipt.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({receipt.durationHours} hours)
                  </p>
                </div>
                <div className="text-right font-black text-base text-slate-900">
                  ₹{receipt.amount}
                </div>
              </div>
            </div>

            {/* Total Paid Block */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Total Paid via Razorpay
                </span>
                <p className="text-3xl font-black text-emerald-950">₹{receipt.amount}</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Ref: <span className="font-mono">{receipt.razorpayPaymentId || 'Verified Online'}</span>
                </p>
              </div>
              <div className="text-right text-xs text-emerald-900">
                <p className="font-bold">Booked by {receipt.familyName}</p>
                <p>{new Date(receipt.paidAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 text-center text-xs text-slate-500 print:hidden">
              Thank you for choosing DearHand. For 24/7 care support in Mysuru, contact +91 80000 12345.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
