import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import {
  ShieldAlert,
  Package,
  FileText,
  Radio,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';

export default function AdminOperationsConsole({ onBackToDashboard, onNavigateBookingDetail }) {
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'packages' | 'audit' | 'notifications'

  // Incident state
  const [incidents, setIncidents] = useState([]);
  const [incidentFilter, setIncidentFilter] = useState('ALL');
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // Package state
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: '',
    type: 'TASK',
    durationHours: 2,
    basePrice: '',
    active: true,
  });
  const [savingPackage, setSavingPackage] = useState(false);

  // Audit state
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [message, setMessage] = useState(null);

  // --- Fetchers ---

  const loadIncidents = async () => {
    try {
      setLoadingIncidents(true);
      const url = incidentFilter === 'ALL' ? '/admin/incidents' : `/admin/incidents?status=${incidentFilter}`;
      const data = await apiRequest(url);
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      const data = await apiRequest('/admin/packages');
      setPackages(data);
    } catch (err) {
      console.error('Failed to load packages', err);
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const data = await apiRequest('/admin/audit-logs');
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await apiRequest('/admin/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'incidents') loadIncidents();
    if (activeTab === 'packages') loadPackages();
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'notifications') loadNotifications();
  }, [activeTab, incidentFilter]);

  // --- Incident Handlers ---

  const handleResolveIncident = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setResolving(true);
    try {
      await apiRequest(`/admin/incidents/${selectedIncident.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: resolutionStatus,
          resolutionNotes: resolutionNotes.trim(),
        }),
      });
      setMessage({ type: 'success', text: `Incident #${selectedIncident.id} updated to ${resolutionStatus}` });
      setSelectedIncident(null);
      setResolutionNotes('');
      loadIncidents();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update incident' });
    } finally {
      setResolving(false);
    }
  };

  // --- Package Handlers ---

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setSavingPackage(true);
    try {
      if (editingPackage) {
        // Update
        await apiRequest(`/admin/packages/${editingPackage.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: packageForm.name,
            durationHours: parseInt(packageForm.durationHours, 10),
            basePrice: parseFloat(packageForm.basePrice),
            active: packageForm.active,
          }),
        });
        setMessage({ type: 'success', text: `Package '${packageForm.name}' updated successfully` });
      } else {
        // Create
        await apiRequest('/admin/packages', {
          method: 'POST',
          body: JSON.stringify({
            name: packageForm.name,
            type: packageForm.type,
            durationHours: parseInt(packageForm.durationHours, 10),
            basePrice: parseFloat(packageForm.basePrice),
            active: packageForm.active,
          }),
        });
        setMessage({ type: 'success', text: `Package '${packageForm.name}' created successfully` });
      }
      setEditingPackage(null);
      setShowAddPackageModal(false);
      loadPackages();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save package' });
    } finally {
      setSavingPackage(false);
    }
  };

  const openEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      type: pkg.type,
      durationHours: pkg.durationHours,
      basePrice: pkg.basePrice,
      active: pkg.active,
    });
    setShowAddPackageModal(true);
  };

  const openAddPackage = () => {
    setEditingPackage(null);
    setPackageForm({
      name: '',
      type: 'TASK',
      durationHours: 2,
      basePrice: '499.00',
      active: true,
    });
    setShowAddPackageModal(true);
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.actorName?.toLowerCase().includes(q) ||
      log.entity?.toLowerCase().includes(q) ||
      log.actorEmail?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-base mb-2 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Operations & Governance Console
          </h2>
          <p className="text-base text-slate-600 mt-1">
            Real-time incident response, package pricing, compliance audit trail, and dispatch logs.
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base min-h-[44px] transition-all ${
              activeTab === 'incidents'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Safety & Incidents
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base min-h-[44px] transition-all ${
              activeTab === 'packages'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            Packages & Pricing
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base min-h-[44px] transition-all ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Audit Trail
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base min-h-[44px] transition-all ${
              activeTab === 'notifications'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Radio className="w-4 h-4" />
            Dispatch Outbox
          </button>
        </div>
      </div>

      {/* Global Toast / Alert */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-red-50 text-red-900 border border-red-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className="text-base font-bold">{message.text}</p>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* --- TAB 1: INCIDENTS & SAFETY DESK --- */}
      {activeTab === 'incidents' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <span className="font-bold text-base text-slate-800">Filter Status:</span>
              {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setIncidentFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold min-h-[36px] transition-colors ${
                    incidentFilter === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              onClick={loadIncidents}
              disabled={loadingIncidents}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm min-h-[40px]"
            >
              <RefreshCw className={`w-4 h-4 ${loadingIncidents ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
          </div>

          {loadingIncidents ? (
            <div className="p-12 text-center text-slate-500 text-base">Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900">Zero Incident Reports</h3>
              <p className="text-base text-slate-600">
                All pilot bookings in Mysuru are operating safely without reported anomalies.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 text-lg">
                        Incident #{inc.id}
                      </span>
                      <button
                        onClick={() => onNavigateBookingDetail && onNavigateBookingDetail(inc.bookingId)}
                        className="text-sm font-bold text-teal-700 hover:underline"
                      >
                        Booking #{inc.bookingId} &rarr;
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Severity Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          inc.severity === 'HIGH'
                            ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                            : inc.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}
                      >
                        {inc.severity} Severity
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          inc.status === 'OPEN'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : inc.status === 'INVESTIGATING'
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-2xl">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Parent Profile</p>
                      <p className="font-bold text-slate-900 text-base">{inc.parentName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Assigned Helper</p>
                      <p className="font-bold text-slate-900 text-base">{inc.helperName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Reported By</p>
                      <p className="font-bold text-slate-900 text-base">
                        {inc.reportedByName} · {new Date(inc.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Description & Log</p>
                    <p className="text-base text-slate-800 bg-slate-50 p-4 rounded-2xl whitespace-pre-line border border-slate-200 font-medium">
                      {inc.description}
                    </p>
                  </div>

                  {inc.status !== 'RESOLVED' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setResolutionStatus('RESOLVED');
                          setResolutionNotes('');
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-xl min-h-[44px] transition-colors"
                      >
                        Take Action / Resolve &rarr;
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* --- TAB 2: PACKAGES & PRICING --- */}
      {activeTab === 'packages' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Care Packages Catalog</h3>
              <p className="text-sm text-slate-600">
                Update base pricing in INR, duration, and active booking availability for the Mysuru pilot.
              </p>
            </div>
            <button
              onClick={openAddPackage}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base min-h-[44px] shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5" /> Add New Package
            </button>
          </div>

          {loadingPackages ? (
            <div className="p-12 text-center text-slate-500 text-base">Loading packages...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white border-2 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 ${
                    pkg.active ? 'border-slate-200' : 'border-slate-200 bg-slate-50 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                          pkg.active
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {pkg.active ? 'Active' : 'Archived'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase">{pkg.type}</span>
                    </div>

                    <h4 className="text-2xl font-black text-slate-900">{pkg.name}</h4>
                    <p className="text-sm text-slate-600">Standard Duration: {pkg.durationHours} Hours</p>
                    <p className="text-3xl font-black text-teal-700">₹{pkg.basePrice}</p>
                  </div>

                  <button
                    onClick={() => openEditPackage(pkg)}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-base min-h-[44px] border border-slate-300 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Price & Settings
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* --- TAB 3: AUDIT TRAIL --- */}
      {activeTab === 'audit' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit actions, actors, entities..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              onClick={loadAuditLogs}
              disabled={loadingAudit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm min-h-[40px]"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAudit ? 'animate-spin' : ''}`} />
              Refresh Trail
            </button>
          </div>

          {loadingAudit ? (
            <div className="p-12 text-center text-slate-500 text-base">Loading audit logs...</div>
          ) : filteredAuditLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-base">No audit entries found.</div>
          ) : (
            <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Actor</th>
                      <th className="py-3.5 px-4">Entity</th>
                      <th className="py-3.5 px-4">Action Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{log.actorName}</p>
                          <p className="text-xs text-slate-500">{log.actorEmail}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-bold text-xs text-slate-800">
                            {log.entity} #{log.entityId || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-mono text-xs">
                          {log.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- TAB 4: DISPATCH NOTIFICATIONS OUTBOX --- */}
      {activeTab === 'notifications' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Multi-Channel Outbox</h3>
              <p className="text-sm text-slate-600">
                Log of real-time dispatches via WhatsApp, SMS, and In-App push.
              </p>
            </div>
            <button
              onClick={loadNotifications}
              disabled={loadingNotifications}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm min-h-[40px]"
            >
              <RefreshCw className={`w-4 h-4 ${loadingNotifications ? 'animate-spin' : ''}`} />
              Refresh Outbox
            </button>
          </div>

          {loadingNotifications ? (
            <div className="p-12 text-center text-slate-500 text-base">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-base">No notifications sent yet.</div>
          ) : (
            <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Time</th>
                      <th className="py-3.5 px-4">Recipient</th>
                      <th className="py-3.5 px-4">Channel</th>
                      <th className="py-3.5 px-4">Template Message</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{n.userName}</p>
                          <p className="text-xs text-slate-500">{n.userEmail}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold">
                            {n.channel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 text-sm">
                          {n.template}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              n.status === 'SENT' || n.status === 'READ'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- MODAL: RESOLVE INCIDENT --- */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-red-700">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-2xl font-black text-slate-900">
                  Resolve Incident #{selectedIncident.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Update Incident Status
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="INVESTIGATING">INVESTIGATING (Under Review)</option>
                  <option value="RESOLVED">RESOLVED (Action Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Admin Resolution Notes & Action Plan
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Summarize phone follow-up with family, helper clarification, or compensation provided..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-base min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-base min-h-[44px] shadow-sm transition-colors"
                >
                  {resolving ? 'Submitting...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT PACKAGE --- */}
      {showAddPackageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-teal-700">
                <Package className="w-6 h-6" />
                <h3 className="text-2xl font-black text-slate-900">
                  {editingPackage ? 'Edit Care Package' : 'Create Care Package'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddPackageModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Package Name</label>
                <input
                  type="text"
                  required
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  placeholder="e.g. Doctor Visit Companion"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={packageForm.durationHours}
                    onChange={(e) => setPackageForm({ ...packageForm, durationHours: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Base Price (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={packageForm.basePrice}
                    onChange={(e) => setPackageForm({ ...packageForm, basePrice: e.target.value })}
                    placeholder="499.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                  <input
                    type="checkbox"
                    checked={packageForm.active}
                    onChange={(e) => setPackageForm({ ...packageForm, active: e.target.checked })}
                    className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-bold text-base text-slate-900">Active & available for booking</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPackageModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-base min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPackage}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base min-h-[44px] shadow-sm transition-colors"
                >
                  {savingPackage ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
