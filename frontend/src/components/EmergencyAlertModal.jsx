import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import {
  AlertTriangle,
  Siren,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert
} from 'lucide-react';

export default function EmergencyAlertModal({ booking, onClose, onSuccess }) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('CRITICAL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of the emergency.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const incident = await apiRequest(`/bookings/${booking.id}/emergency`, {
        method: 'POST',
        body: JSON.stringify({
          description: description.trim(),
          severity,
        }),
      });
      onSuccess(incident);
    } catch (err) {
      setError(err.message || 'Failed to raise emergency alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-red-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 border-4 border-red-500 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3 text-red-600">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center animate-pulse">
              <Siren className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Emergency Alert
              </h3>
              <p className="text-xs font-black uppercase tracking-wider text-red-600">
                Immediate Mysuru Operations Escalation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-base font-bold text-red-900">{error}</p>
          </div>
        )}

        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-red-600" /> Direct Emergency Hotline:
          </p>
          <p className="text-base font-extrabold text-red-950">
            Police: 112 · Ambulance: 108 · DearHand Ops: +91 80000 12345
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1">
              Select Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                <button
                  type="button"
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-sm border-2 transition-all min-h-[44px] ${
                    severity === sev
                      ? 'bg-red-600 text-white border-red-700 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1">
              Describe What Happened
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Parent fell in bathroom, conscious but needs medical assistance. Ambulance summoned."
              className="w-full px-4 py-3 text-base border-2 border-red-300 rounded-2xl focus:border-red-600 focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg rounded-2xl min-h-[48px] shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-6 h-6" />
              {submitting ? 'Broadcasting Alert...' : 'Broadcast SOS Emergency Alert'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl min-h-[48px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
