import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Car,
  AlertCircle,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

export default function HelperOnboardingPage({ onBackToDashboard }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('Kannada, English');
  const [skills, setSkills] = useState('First Aid, Wheelchair Handling, Driving, Smartphone/UPI Help');
  const [hasLicence, setHasLicence] = useState(true);
  const [licenceNo, setLicenceNo] = useState('');
  const [licenceExpiry, setLicenceExpiry] = useState('');
  const [vehicleType, setVehicleType] = useState('Two Wheeler / Four Wheeler');
  const [yearsExperience, setYearsExperience] = useState(3);

  // Document upload state
  const [docType, setDocType] = useState('GOVERNMENT_ID');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/helpers/me');
      setProfile(data);
      if (data) {
        setBio(data.bio || '');
        setLanguages(data.languages || 'Kannada, English');
        setSkills(data.skills || '');
        setHasLicence(data.hasLicence ?? true);
        setLicenceNo(data.licenceNo || '');
        setLicenceExpiry(data.licenceExpiry || '');
        setVehicleType(data.vehicleType || '');
        setYearsExperience(data.yearsExperience ?? 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch helper profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);
    try {
      const updated = await apiRequest('/helpers/apply', {
        method: 'POST',
        body: JSON.stringify({
          bio,
          languages,
          skills,
          hasLicence,
          licenceNo: hasLicence ? licenceNo : null,
          licenceExpiry: hasLicence && licenceExpiry ? licenceExpiry : null,
          vehicleType,
          yearsExperience: parseInt(yearsExperience, 10),
        }),
      });
      setProfile(updated);
      setMessage('Profile details updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload');
      return;
    }

    setMessage(null);
    setError(null);
    setUploading(true);

    try {
      const token = localStorage.getItem('dearhand_token');
      const formData = new FormData();
      formData.append('type', docType);
      formData.append('file', selectedFile);

      const res = await fetch('/api/v1/helpers/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Upload failed');
      }

      setMessage(`Document ${docType} uploaded successfully!`);
      setSelectedFile(null);
      // Refresh profile to show document
      await fetchProfile();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-base font-bold text-slate-700">Loading your helper profile...</p>
      </div>
    );
  }

  const status = profile?.status || 'APPLIED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner and Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-teal-700 hover:text-teal-800 font-bold text-base mb-2 inline-flex items-center gap-1"
          >
            &larr; Back to Dashboard
          </button>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Helper Onboarding & Safety Verification
          </h2>
          <p className="text-base text-slate-600">
            Trust is our core product. Complete your details and document checks to become bookable.
          </p>
        </div>
      </div>

      {/* Verification Stages Visual Pipeline */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Verification Lifecycle</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              status === 'APPLIED'
                ? 'border-amber-400 bg-amber-50 text-amber-950 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center mx-auto mb-1 text-sm font-bold">
              1
            </div>
            <p className="text-base font-bold">Applied</p>
            <p className="text-xs text-slate-500">Details & docs submitted</p>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              status === 'VERIFIED'
                ? 'border-blue-400 bg-blue-50 text-blue-950 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center mx-auto mb-1 text-sm font-bold">
              2
            </div>
            <p className="text-base font-bold">Verified</p>
            <p className="text-xs text-slate-500">ID & police check cleared</p>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              status === 'APPROVED'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center mx-auto mb-1 text-sm font-bold">
              3
            </div>
            <p className="text-base font-bold">Approved</p>
            <p className="text-xs text-slate-500">Live & bookable by families</p>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              status === 'SUSPENDED'
                ? 'border-red-500 bg-red-50 text-red-950 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-red-200 text-red-900 flex items-center justify-center mx-auto mb-1 text-sm font-bold">
              !
            </div>
            <p className="text-base font-bold">Suspended</p>
            <p className="text-xs text-slate-400">Account paused</p>
          </div>
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

      {/* Part 1: Helper Bio & Driving Details */}
      <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Step 1: Application Profile</h3>
        <p className="text-base text-slate-600 mb-6">
          Provide your experience, local Mysore languages, and driving licence details.
        </p>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="helper-bio">
              Brief Bio & Introduction
            </label>
            <textarea
              id="helper-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell families about your background and why you care for seniors in Mysuru..."
              className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="helper-languages">
                Spoken Languages
              </label>
              <input
                id="helper-languages"
                type="text"
                required
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. Kannada, English, Hindi"
                className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="helper-skills">
                Skills & Experience
              </label>
              <input
                id="helper-skills"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. First Aid, Wheelchair, Driving, UPI"
                className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 min-h-[44px]"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <input
                id="helper-has-licence"
                type="checkbox"
                checked={hasLicence}
                onChange={(e) => setHasLicence(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="helper-has-licence" className="text-base font-bold text-slate-900">
                I hold a valid motor driving licence
              </label>
            </div>

            {hasLicence && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1" htmlFor="licence-no">
                    Licence Number
                  </label>
                  <input
                    id="licence-no"
                    type="text"
                    value={licenceNo}
                    onChange={(e) => setLicenceNo(e.target.value)}
                    placeholder="KA09-XXXX-XXXX"
                    className="w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1" htmlFor="licence-expiry">
                    Validity Expiry Date
                  </label>
                  <input
                    id="licence-expiry"
                    type="date"
                    value={licenceExpiry}
                    onChange={(e) => setLicenceExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1" htmlFor="vehicle-type">
                    Vehicle Type
                  </label>
                  <input
                    id="vehicle-type"
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="Car / Bike"
                    className="w-full px-3 py-2 text-base text-slate-900 bg-white border border-slate-300 rounded-lg min-h-[44px]"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl min-h-[44px] shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving Profile...' : 'Save Profile Details'}
          </button>
        </form>
      </section>

      {/* Part 2: Document Upload Zone */}
      <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">Step 2: Upload Verification Documents</h3>
          <p className="text-base text-slate-600">
            DearHand stores all documents privately. They are only inspected by authorized operations staff.
          </p>
        </div>

        <form onSubmit={handleDocumentUpload} className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="doc-type">
                Document Type
              </label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl min-h-[44px]"
              >
                <option value="GOVERNMENT_ID">Government ID (Aadhaar / Voter ID)</option>
                <option value="DRIVING_LICENCE">Driving Licence</option>
                <option value="POLICE_VERIFICATION">Police Verification Certificate</option>
                <option value="HEALTH_DECLARATION">Basic Health Declaration</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="doc-file">
                Choose PDF or Image
              </label>
              <input
                id="doc-file"
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full text-base text-slate-800 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-teal-100 file:text-teal-800 hover:file:bg-teal-200 min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-xl min-h-[44px] shadow transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading securely...' : 'Upload Document'}
          </button>
        </form>

        {/* Uploaded Documents List */}
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-3">Uploaded Verification Files</h4>
          {profile?.documents && profile.documents.length > 0 ? (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
              {profile.documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-teal-600" />
                    <div>
                      <p className="font-bold text-slate-900 text-base">{doc.type.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        Key: {doc.fileKey} · Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    Pending Admin Review
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base text-slate-500 italic">No documents uploaded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
