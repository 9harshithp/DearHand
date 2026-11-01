import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, HeartHandshake, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage({ onNavigateLogin, onSuccess }) {
  const { register } = useAuth();
  const [role, setRole] = useState('FAMILY');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        name,
        phone,
        email,
        password,
        role,
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 px-4">
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-base text-slate-600 mt-1">
            Join DearHand to support elderly parents in Mysuru
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-base text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('FAMILY')}
            className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[44px] ${
              role === 'FAMILY'
                ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <HeartHandshake className={`w-5 h-5 ${role === 'FAMILY' ? 'text-teal-700' : 'text-slate-500'}`} />
              <span className={`font-bold text-base ${role === 'FAMILY' ? 'text-teal-900' : 'text-slate-700'}`}>
                Family / Child
              </span>
            </div>
            <p className="text-xs text-slate-600">
              I want to book vetted care for my parents in Mysuru
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRole('HELPER')}
            className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[44px] ${
              role === 'HELPER'
                ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className={`w-5 h-5 ${role === 'HELPER' ? 'text-teal-700' : 'text-slate-500'}`} />
              <span className={`font-bold text-base ${role === 'HELPER' ? 'text-teal-900' : 'text-slate-700'}`}>
                Helper
              </span>
            </div>
            <p className="text-xs text-slate-600">
              I want to earn by assisting elderly families
            </p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="reg-name">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="reg-phone">
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="reg-email">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-slate-900 mb-1" htmlFor="reg-password">
              Password (min. 6 characters)
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl min-h-[44px] flex items-center justify-center gap-2 shadow-md transition-colors text-lg disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'FAMILY' ? 'Family Booker' : 'Helper'}`}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-base text-slate-600">
            Already registered?{' '}
            <button
              onClick={onNavigateLogin}
              className="font-bold text-teal-700 hover:text-teal-800 underline underline-offset-4 min-h-[44px]"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
