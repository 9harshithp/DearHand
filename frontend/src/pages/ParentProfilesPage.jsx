import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Users, Plus, Edit2, CheckCircle2, AlertCircle, ArrowLeft, Heart, HeartPulse, Phone, MapPin } from 'lucide-react';

export default function ParentProfilesPage({ onBack }) {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingParent, setEditingParent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState(72);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mysuru');
  const [language, setLanguage] = useState('Kannada, English');
  const [careNotes, setCareNotes] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+91');

  const fetchParents = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/parents');
      setParents(data);
    } catch (err) {
      setError(err.message || 'Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const openAddForm = () => {
    setEditingParent(null);
    setName('');
    setAge(72);
    setAddress('');
    setCity('Mysuru');
    setLanguage('Kannada, English');
    setCareNotes('');
    setMedicalHistory('');
    setEmergencyContactName('');
    setEmergencyContactPhone('+91');
    setIsAdding(true);
    setMessage(null);
    setError(null);
  };

  const openEditForm = (p) => {
    setEditingParent(p);
    setName(p.name);
    setAge(p.age);
    setAddress(p.address);
    setCity(p.city || 'Mysuru');
    setLanguage(p.language || 'Kannada');
    setCareNotes(p.careNotes || '');
    setMedicalHistory(p.medicalHistory || '');
    setEmergencyContactName(p.emergencyContactName);
    setEmergencyContactPhone(p.emergencyContactPhone);
    setIsAdding(true);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const payload = {
      name,
      age: parseInt(age, 10),
      address,
      city,
      language,
      careNotes,
      medicalHistory,
      emergencyContactName,
      emergencyContactPhone,
    };

    try {
      if (editingParent) {
        await apiRequest(`/parents/${editingParent.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage('Parent profile updated successfully!');
      } else {
        await apiRequest('/parents', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('Parent profile created successfully!');
      }
      setIsAdding(false);
      setEditingParent(null);
      await fetchParents();
    } catch (err) {
      setError(err.message || 'Failed to save parent profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-teal-700 hover:text-teal-800 font-bold text-base mb-2 inline-flex items-center gap-1 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Parent Profiles
          </h2>
          <p className="text-base text-slate-600">
            Care notes, home address in Mysuru, and emergency contacts for your loved ones.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl min-h-[44px] shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Parent Profile
          </button>
        )}
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

      {/* Add / Edit Form Modal Card */}
      {isAdding && (
        <section className="bg-white border-2 border-teal-600/40 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {editingParent ? 'Edit Parent Profile' : 'Add New Parent Profile'}
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-500 hover:text-slate-800 font-bold text-base px-3 py-1.5 rounded-lg"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="parent-name">
                  Parent / Couple Name *
                </label>
                <input
                  id="parent-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. K. S. Rao & Shakuntala"
                  className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="parent-age">
                  Age (years) *
                </label>
                <input
                  id="parent-age"
                  type="number"
                  required
                  min={50}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="parent-address">
                Full Address in Mysuru *
              </label>
              <textarea
                id="parent-address"
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No, Street, Landmark, Mysuru neighborhood"
                className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="parent-lang">
                  Language Spoken *
                </label>
                <input
                  id="parent-lang"
                  type="text"
                  required
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. Kannada, English, Hindi"
                  className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="parent-city">
                  City
                </label>
                <input
                  id="parent-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-100 border-2 border-slate-300 rounded-xl min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="medical-history">
                Medical History & Health Conditions
              </label>
              <textarea
                id="medical-history"
                rows={3}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes, cardiac history/stent, penicillin allergy, mobility limitations, hearing aid..."
                className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600"
              />
              <p className="text-sm text-slate-500 mt-1">
                Shared securely with assigned helpers so they are aware of important health context and precautions.
              </p>
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="care-notes">
                Special Care Notes & Daily Routine
              </label>
              <textarea
                id="care-notes"
                rows={2}
                value={careNotes}
                onChange={(e) => setCareNotes(e.target.value)}
                placeholder="e.g. Uses walking stick, doctor checkup every Tuesday at Apollo, morning walks, tea preferences..."
                className="w-full px-4 py-2.5 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1" htmlFor="em-name">
                  Emergency Contact Name *
                </label>
                <input
                  id="em-name"
                  type="text"
                  required
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Rohan Rao (Son in Bengaluru)"
                  className="w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1" htmlFor="em-phone">
                  Emergency Contact Phone *
                </label>
                <input
                  id="em-phone"
                  type="tel"
                  required
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+919880011223"
                  className="w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl min-h-[44px] shadow transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingParent ? 'Update Profile' : 'Save Parent Profile'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Parents List */}
      <section className="space-y-4">
        {loading ? (
          <p className="text-base text-slate-500 py-6 text-center">Loading parent profiles...</p>
        ) : parents.length === 0 ? (
          <div className="p-10 bg-white border-2 border-dashed border-slate-300 rounded-3xl text-center space-y-3">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No parent profiles added yet</h3>
            <p className="text-base text-slate-600 max-w-md mx-auto">
              Add your parents' details and address in Mysuru so helpers know who to assist and where to arrive.
            </p>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-base min-h-[44px] shadow"
            >
              <Plus className="w-5 h-5" /> Add First Parent Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parents.map((p) => (
              <div
                key={p.id}
                className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{p.name}</h4>
                      <p className="text-sm font-semibold text-teal-800">
                        Age: {p.age} years · Language: {p.language}
                      </p>
                    </div>
                    <button
                      onClick={() => openEditForm(p)}
                      title="Edit Profile"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-base text-slate-700 flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{p.address}, {p.city}</span>
                  </p>

                  {p.medicalHistory && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-950 flex items-start gap-2.5">
                      <HeartPulse className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-rose-900 font-bold mb-0.5">Medical History & Conditions:</strong>
                        <span className="text-slate-800">{p.medicalHistory}</span>
                      </div>
                    </div>
                  )}

                  {p.careNotes && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-950">
                      <strong className="text-amber-900">Care Notes:</strong> {p.careNotes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-sm text-slate-600 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>
                    Emergency Contact: <strong>{p.emergencyContactName}</strong> ({p.emergencyContactPhone})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
