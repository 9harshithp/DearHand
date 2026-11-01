import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Ban,
  FileText,
  Filter,
  UserCheck,
  AlertCircle,
  Eye,
  Car
} from 'lucide-react';

export default function AdminHelperVerificationPage({ onBackToDashboard }) {
  const [helpers, setHelpers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchHelpers = async () => {
    try {
      setLoading(true);
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const data = await apiRequest(`/admin/helpers${query}`);
      setHelpers(data);
      if (selectedHelper) {
        const refreshed = data.find((h) => h.id === selectedHelper.id);
        if (refreshed) setSelectedHelper(refreshed);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch helper applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers();
  }, [statusFilter]);

  const handleUpdateStatus = async (helperId, newStatus) => {
    setUpdating(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await apiRequest(`/admin/helpers/${helperId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          reasonOrNotes: actionNotes || `Admin marked as ${newStatus}`,
        }),
      });
      setMessage(`Helper #${helperId} (${updated.name}) status changed to ${newStatus}`);
      setActionNotes('');
      await fetchHelpers();
    } catch (err) {
      setError(err.message || 'Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold uppercase">Approved (Bookable)</span>;
      case 'VERIFIED':
        return <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-bold uppercase">Verified (Trial Pending)</span>;
      case 'SUSPENDED':
        return <span className="px-3 py-1 bg-red-100 text-red-900 border border-red-300 rounded-full text-xs font-bold uppercase">Suspended</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold uppercase">Applied</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-teal-700 hover:text-teal-800 font-bold text-base mb-2 inline-flex items-center gap-1"
          >
            &larr; Back to Admin Center
          </button>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Helper Verification Console
          </h2>
          <p className="text-base text-slate-600">
            Verify identity, original driving licence, police certificate, and interview notes before making helpers bookable.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-base text-emerald-900 font-bold">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-base text-red-900 font-bold">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <span className="text-sm font-bold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-4 h-4" /> Filter Status:
        </span>
        {['', 'APPLIED', 'VERIFIED', 'APPROVED', 'SUSPENDED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-sm font-bold min-h-[44px] transition-colors ${
              statusFilter === st
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {st || 'All Applications'}
          </button>
        ))}
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-bold text-slate-900">
            Applicants ({helpers.length})
          </h3>

          {loading ? (
            <p className="text-base text-slate-500 py-4">Loading applicants...</p>
          ) : helpers.length === 0 ? (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
              No applicants found matching filter.
            </div>
          ) : (
            helpers.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedHelper(h)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all min-h-[44px] ${
                  selectedHelper?.id === h.id
                    ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-extrabold text-slate-900 text-lg leading-tight">{h.name}</p>
                  {getStatusBadge(h.status)}
                </div>
                <p className="text-sm text-slate-600">{h.phone} · {h.languages}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Docs: {h.documents?.length || 0} uploaded · {h.hasLicence ? 'Has Licence' : 'No Licence'}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Right Column: Detailed Review & Verification Controls */}
        <div className="lg:col-span-2">
          {selectedHelper ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedHelper.name}</h3>
                  <p className="text-base text-slate-600">
                    Phone: {selectedHelper.phone} · Email: {selectedHelper.email}
                  </p>
                </div>
                <div>{getStatusBadge(selectedHelper.status)}</div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-3 text-base text-slate-800">
                <p><strong>Bio:</strong> {selectedHelper.bio || 'Not provided'}</p>
                <p><strong>Languages:</strong> {selectedHelper.languages}</p>
                <p><strong>Skills:</strong> {selectedHelper.skills || 'None listed'}</p>
                <p><strong>Experience:</strong> {selectedHelper.yearsExperience} years</p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="font-bold text-slate-900">Driving Details:</p>
                  <p className="text-sm mt-1">
                    Licence: {selectedHelper.hasLicence ? selectedHelper.licenceNo || 'Yes' : 'No'} · Expiry: {selectedHelper.licenceExpiry || 'N/A'} · Vehicle: {selectedHelper.vehicleType || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Documents Checklist */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-3">Uploaded Documents</h4>
                {selectedHelper.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedHelper.documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">
                          {doc.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          File: {doc.fileKey}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-amber-700 italic">No documents uploaded yet by this applicant.</p>
                )}
              </div>

              {/* Status Transition Actions */}
              <div className="p-5 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-teal-950 text-base">Update Status & Audit Log</h4>
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Verification notes (e.g. Original driving licence and police certificate verified)"
                  className="w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-xl min-h-[44px]"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedHelper.id, 'VERIFIED')}
                    disabled={updating}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm min-h-[44px]"
                  >
                    Mark Verified
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedHelper.id, 'APPROVED')}
                    disabled={updating}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm min-h-[44px]"
                  >
                    Approve (Make Bookable)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedHelper.id, 'SUSPENDED')}
                    disabled={updating}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm min-h-[44px]"
                  >
                    Suspend Helper
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-500">
              Select an applicant from the left to review their details and manage approval status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
