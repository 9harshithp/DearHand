import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import {
  Calendar,
  Clock,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function NewBookingPage({ onBack, onBookingCreated, onNavigateAddParent }) {
  const [parents, setParents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form selections
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:30');
  const [address, setAddress] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [parentsData, packagesData] = await Promise.all([
          apiRequest('/parents'),
          apiRequest('/packages'),
        ]);
        setParents(parentsData);
        setPackages(packagesData);

        if (parentsData.length > 0) {
          setSelectedParentId(parentsData[0].id.toString());
          setAddress(parentsData[0].address + ', ' + parentsData[0].city);
        }
        if (packagesData.length > 0) {
          setSelectedPackageId(packagesData[0].id.toString());
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleParentChange = (parentId) => {
    setSelectedParentId(parentId);
    const p = parents.find((item) => item.id.toString() === parentId);
    if (p) {
      setAddress(p.address + ', ' + p.city);
    }
  };

  const selectedPackage = packages.find((p) => p.id.toString() === selectedPackageId);
  const selectedParent = parents.find((p) => p.id.toString() === selectedParentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParentId) {
      setError('Please select or add a parent profile');
      return;
    }
    if (!selectedPackageId) {
      setError('Please choose a care package');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const scheduledStartIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

      const booking = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          parentId: parseInt(selectedParentId, 10),
          packageId: parseInt(selectedPackageId, 10),
          scheduledStart: scheduledStartIso,
          address,
          taskNotes,
        }),
      });

      if (onBookingCreated) {
        onBookingCreated(booking.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-base font-bold text-slate-700">Loading booking form...</p>
      </div>
    );
  }

  if (parents.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border-2 border-slate-200 rounded-3xl text-center space-y-4">
        <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Add a Parent Profile First</h3>
        <p className="text-base text-slate-600 max-w-md mx-auto">
          To request a stand-in helper in Mysuru, please add your parent's home address and care notes first.
        </p>
        <button
          onClick={onNavigateAddParent}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base min-h-[44px] shadow"
        >
          Add Parent Profile Now &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-teal-700 hover:text-teal-800 font-bold text-base mb-2 inline-flex items-center gap-1 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Book a Stand-in Helper in Mysuru
        </h2>
        <p className="text-base text-slate-600">
          Book under 3 minutes: choose parent, package, date, and task notes.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-base text-red-900 font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Parent */}
        <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-black">1</span>
            Select Parent
          </h3>

          <select
            value={selectedParentId}
            onChange={(e) => handleParentChange(e.target.value)}
            className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
          >
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Age: {p.age}, {p.city})
              </option>
            ))}
          </select>

          {selectedParent && (
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong>Emergency Contact:</strong> {selectedParent.emergencyContactName} ({selectedParent.emergencyContactPhone})
            </p>
          )}
        </section>

        {/* Step 2: Choose Package */}
        <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-black">2</span>
            Choose Care Package
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {packages.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id.toString();
              return (
                <button
                  type="button"
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id.toString())}
                  className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[44px] flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
                      {pkg.type.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-slate-900 text-lg mt-1 leading-tight">{pkg.name}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Duration: {pkg.durationHours} hours
                    </p>
                  </div>
                  <p className="text-2xl font-black text-teal-900 mt-3">
                    ₹{pkg.basePrice}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Schedule & Task Notes */}
        <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-black">3</span>
            Schedule & Task Notes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="booking-date">
                Visit Date *
              </label>
              <input
                id="booking-date"
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="booking-time">
                Start Time *
              </label>
              <input
                id="booking-time"
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="booking-address">
              Visit Address in Mysuru *
            </label>
            <input
              id="booking-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="booking-notes">
              Task Notes & Instructions for Helper
            </label>
            <textarea
              id="booking-notes"
              rows={3}
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="e.g. Escort to Apollo Hospital for blood test, pick up prescription from Jan Aushadhi store, help with phone UPI recharge..."
              className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600"
            />
          </div>
        </section>

        {/* Step 4: Price Summary & Submission */}
        <section className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-300">
              Total Booking Amount
            </p>
            <p className="text-4xl font-black mt-1">
              ₹{selectedPackage?.basePrice || '0.00'}
            </p>
            <p className="text-sm text-teal-200 mt-1">
              Payment is requested after helper acceptance. Includes pilot support.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-4 bg-teal-400 hover:bg-teal-300 text-teal-950 font-black text-lg rounded-2xl min-h-[44px] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Confirming...' : 'Request Booking Now'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </section>
      </form>
    </div>
  );
}
