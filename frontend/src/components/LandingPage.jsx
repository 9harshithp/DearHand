import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Calendar,
  Users,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star,
  Building,
  Award,
  ChevronDown,
  Sparkles,
  Stethoscope,
  ShoppingBag,
  Car,
  FileCheck2,
  UserCheck,
  CreditCard,
  Lock,
  Compass
} from 'lucide-react';

const PACKAGES = [
  {
    id: 'single',
    title: 'Single Task Escort',
    hours: 'Up to 2 Hours',
    price: 499,
    tag: 'Most Popular for Hospital Visits',
    description: 'Perfect for hospital OPD appointments, doctor consultations, bank pension work, or urgent medicine pickup.',
    features: [
      'Doctor appointment & OPD queue waiting',
      'Wheelchair & mobility assistance',
      'Prescription & medicine pickup from pharmacy',
      'Digital photo check-in & summary sent to family',
      'Kannada & English speaking companion'
    ]
  },
  {
    id: 'half-day',
    title: 'Half-Day Companionship',
    hours: '4 Hours',
    price: 999,
    tag: 'Best for Routine Care',
    description: 'Ideal for morning or afternoon companionship, gentle walks, meal assistance, and multiple errands across Mysuru.',
    features: [
      'Morning walk companion (Kukkarahalli / park)',
      'Grocery & fresh vegetables shopping assistance',
      'Medication reminder & hydration tracking',
      'Light household organization & companionship',
      'Live updates & end-of-visit checklist'
    ]
  },
  {
    id: 'full-day',
    title: 'Full-Day Stand-In Helper',
    hours: '8 Hours',
    price: 1799,
    tag: 'Complete Peace of Mind',
    description: 'Comprehensive day-long supervision when you are travelling, busy with meetings, or need continuous care for parents.',
    features: [
      'Full 8-hour dedicated caregiver presence',
      'Assistance with meals, mobility, and rest routine',
      'Escort to multiple clinics, labs, or family visits',
      'Real-time emergency standby & rapid escalation',
      'Detailed daily health & activity log'
    ]
  }
];

const LOCALITIES = [
  'Jayalakshmipuram',
  'Gokulam 1st - 3rd Stage',
  'Saraswathipuram',
  'V.V. Mohalla',
  'Kuvempunagar',
  'Yadavagiri',
  'Hebbal 1st & 2nd Stage',
  'TK Layout'
];

const FAQS = [
  {
    q: 'How are DearHand helpers vetted in Mysuru?',
    a: 'Every helper undergoes our strict 4-stage protocol: 1) Aadhaar biometric KYC, 2) Mysuru City Police record verification, 3) In-person home visit with 2 local resident reference checks, and 4) Geriatric empathy and basic first-aid training. Only ~12% of applicants pass our screening.'
  },
  {
    q: 'Do the helpers speak Kannada with my parents?',
    a: 'Yes, 100% of our Mysuru helpers speak fluent Kannada and English. They understand local customs, polite Mysore honorifics (thamma, thangi, ree), and know the city hospitals and pharmacies inside out.'
  },
  {
    q: 'When do I have to pay?',
    a: 'There are zero upfront fees to register or request a helper. You only pay securely via Razorpay (UPI, Netbanking, Cards) AFTER a verified helper reviews your parent’s request and accepts the booking.'
  },
  {
    q: 'How do I know the helper actually completed the visit?',
    a: 'Every visit requires digital geo-verified check-in, start/end timestamps, caregiver observation notes, and photographic proof (such as hospital OPD slips, pharmacy bills, or companion photos). You can see this directly in your DearHand dashboard.'
  },
  {
    q: 'Can I book a helper if I live in Bengaluru or outside India?',
    a: 'Over 70% of our families live in Bengaluru, Mumbai, or overseas (US, UK, Singapore). You manage everything from your smartphone — booking, payments, and live visit notes — while your parents in Mysuru receive caring, dignified in-person help.'
  }
];

export default function LandingPage({ onGetStarted, onSignIn, onSelectPackage }) {
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const activePkg = PACKAGES[selectedPkgIndex];

  const handleAction = (pkgId) => {
    if (onSelectPackage) {
      onSelectPackage(pkgId);
    } else if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* ===== LOCAL SERVICE BANNER ===== */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-teal-100 py-2.5 px-4 text-center text-sm font-medium border-b border-teal-700/50">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-200 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Mysuru Elder Care
          </span>
          <span>Verified stand-in helpers actively serving <strong>Gokulam, Jayalakshmipuram, Saraswathipuram & Kuvempunagar</strong></span>
        </div>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-white border-b border-slate-200">
        {/* Soft radial background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-50 via-emerald-50/40 to-transparent blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                100% Police & Biometric Verified Companions
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                You Work In Bengaluru.{' '}
                <span className="text-teal-700 block">
                  We Stand By Your Parents In Mysuru.
                </span>
              </h1>

              <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Book a trusted, police-verified companion for your elderly parents’ <strong>hospital OPD visits, pharmacy pickups, bank errands & daily walks</strong>. With real-time photo check-ins and zero upfront charges.
              </p>

              {/* Value Badges */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Kannada & English</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Photo Proof of Visit</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Razorpay Protected</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => handleAction('single')}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all min-h-[48px]"
                >
                  Book a Verified Helper <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#pricing-calculator"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-base rounded-2xl transition-all hover:bg-slate-50 min-h-[48px]"
                >
                  View Packages & Rates
                </a>
              </div>

              <div className="mt-4 flex items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> No subscription required
                </span>
                <span>•</span>
                <span>Pay only when helper confirms</span>
              </div>
            </div>

            {/* Right Simulation Card (Real-world human proof) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Decorative border card */}
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-1.5 shadow-2xl">
                  <div className="rounded-[22px] bg-white p-6">
                    {/* Live Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Live Visit Update
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">Jayalakshmipuram</span>
                    </div>

                    {/* Caregiver & Parent Profile */}
                    <div className="mt-4 p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                          SK
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-slate-900 text-sm">Suresh Kumar</h4>
                            <ShieldCheck className="w-4 h-4 text-teal-600" />
                          </div>
                          <p className="text-xs font-semibold text-slate-500">Assigned Helper · 4.9 ★ (42 visits)</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs">
                        Kannada / Eng
                      </span>
                    </div>

                    {/* Timeline of Visit */}
                    <div className="mt-5 space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">09:15 AM · Picked up Dr. K.S. Rao (Parent)</p>
                          <p className="text-slate-500">Gokulam 3rd Stage · Safe boarding assisted</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">10:00 AM · Apollo BGS Hospital OPD Escort</p>
                          <p className="text-slate-500">Token #14 queued, accompanied through consultation</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">11:15 AM · Medplus Pharmacy Pickup</p>
                          <p className="text-slate-500">Prescription bill photo uploaded to family dashboard</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Paid by daughter in Indiranagar</span>
                      <span className="font-bold text-slate-900">₹499 · Completed</span>
                    </div>
                  </div>
                </div>

                {/* Subtle floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">4.9 / 5 Parent Rating</p>
                    <p className="text-[11px] text-slate-500">Across 1,200+ Mysuru visits</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== TRUST BAR & LOCAL COVERAGE ===== */}
      <section className="bg-slate-900 text-white py-8 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-2">
              <p className="text-3xl font-extrabold text-teal-400">1,200+</p>
              <p className="text-sm font-semibold text-slate-300 mt-1">Accompanied Visits</p>
              <p className="text-xs text-slate-500 mt-0.5">Hospital, clinic & banking</p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-extrabold text-teal-400">100%</p>
              <p className="text-sm font-semibold text-slate-300 mt-1">Police & KYC Checked</p>
              <p className="text-xs text-slate-500 mt-0.5">Zero tolerance vetting</p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-extrabold text-teal-400">&lt; 3 Mins</p>
              <p className="text-sm font-semibold text-slate-300 mt-1">Effortless Booking</p>
              <p className="text-xs text-slate-500 mt-0.5">No lengthy paperwork</p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-extrabold text-teal-400">4.9 ★</p>
              <p className="text-sm font-semibold text-slate-300 mt-1">Parent Satisfaction</p>
              <p className="text-xs text-slate-500 mt-0.5">Mysuru family trust</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="font-bold text-slate-300 uppercase tracking-wider mr-2">Localities Covered:</span>
            {LOCALITIES.map((loc) => (
              <span key={loc} className="bg-slate-800/90 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                {loc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE PRICING & CARE CALCULATOR ===== */}
      <section id="pricing-calculator" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Clear & Transparent Pricing
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pay Per Visit. No Locked-In Subscriptions.
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Select the level of care your parents need today. Every package includes a verified, Kannada-speaking companion with live photo proof.
            </p>
          </div>

          {/* Package Selector Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 max-w-full overflow-x-auto">
              {PACKAGES.map((pkg, idx) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkgIndex(idx)}
                  className={`px-5 py-3 rounded-xl text-sm font-bold transition-all min-h-[44px] whitespace-nowrap ${
                    selectedPkgIndex === idx
                      ? 'bg-white text-teal-900 shadow-md border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pkg.title} · ₹{pkg.price}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Selected Package Card */}
          <div className="max-w-3xl mx-auto bg-slate-50 border-2 border-teal-600/30 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl">
              {activePkg.tag}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{activePkg.title}</h3>
                <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" /> Duration: {activePkg.hours}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-4xl font-black text-teal-700">₹{activePkg.price}</div>
                <p className="text-xs font-semibold text-slate-500">Fixed rate per visit · All inclusive</p>
              </div>
            </div>

            <p className="mt-4 text-base text-slate-700 leading-relaxed font-medium">
              {activePkg.description}
            </p>

            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Everything Included In This Visit:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>UPI, Cards, Netbanking via Razorpay · Invoice generated instantly</span>
              </div>
              <button
                onClick={() => handleAction(activePkg.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-xl shadow-md transition-colors min-h-[44px]"
              >
                Book {activePkg.title} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE 4-STAGE SAFETY PROTOCOL ===== */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
              Safety Above Everything
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our 4-Stage Helper Vetting Protocol
            </h2>
            <p className="mt-3 text-base text-slate-600">
              We never send a stranger to your parents' home. Every DearHand caregiver passes thorough physical and criminal verifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: ShieldCheck,
                title: 'Police & Aadhaar KYC',
                desc: 'Government photo ID biometric validation alongside Mysuru City Police record check.'
              },
              {
                step: '02',
                icon: HeartHandshake,
                title: 'Elder Care Empathy',
                desc: 'In-person interview testing patience, gentle mobility handling, and basic emergency response.'
              },
              {
                step: '03',
                icon: Users,
                title: 'Neighbourhood Checks',
                desc: 'Physical residence verification with two local resident character references in Mysuru.'
              },
              {
                step: '04',
                icon: Award,
                title: 'Supervised Trial Visit',
                desc: 'Helper’s first booking is accompanied by an experienced DearHand operations supervisor.'
              }
            ].map((stage) => (
              <div
                key={stage.step}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-teal-600">{stage.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <stage.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{stage.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{stage.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Mandatory
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON MATRIX ===== */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Families Choose DearHand Over Informal Alternatives
            </h2>
            <p className="mt-3 text-base text-slate-600">
              When it comes to vulnerable elderly parents, consistency, verification, and proof matter.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-sm">
                  <th className="p-4 sm:p-5 font-bold">Key Consideration</th>
                  <th className="p-4 sm:p-5 font-black text-teal-300 bg-slate-800">DearHand Verified Stand-In</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-300">Unvetted Maid / Auto</th>
                  <th className="p-4 sm:p-5 font-semibold text-slate-300">Hospital Attendant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Background & Police Clearance</td>
                  <td className="p-4 sm:p-5 bg-teal-50/50 font-bold text-teal-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> Thorough 4-stage vetting
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">None / Pure word of mouth</td>
                  <td className="p-4 sm:p-5 text-slate-500">Basic hospital badge only</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Photo Proof & Digital Notes</td>
                  <td className="p-4 sm:p-5 bg-teal-50/50 font-bold text-teal-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> Real-time bills & photos
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">Zero documentation</td>
                  <td className="p-4 sm:p-5 text-slate-500">None</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Queue Waiting & Companionship</td>
                  <td className="p-4 sm:p-5 bg-teal-50/50 font-bold text-teal-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> Patient 2 - 8 hr companion
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">Rushed / Drops at gate</td>
                  <td className="p-4 sm:p-5 text-slate-500">Leaves after wheelchair transfer</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Transparent Fixed Pricing</td>
                  <td className="p-4 sm:p-5 bg-teal-50/50 font-bold text-teal-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" /> Fixed ₹499 - ₹1,799 via Razorpay
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">Unpredictable cash demands</td>
                  <td className="p-4 sm:p-5 text-slate-500">Expensive ward charges</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== REAL PARENT & FAMILY TESTIMONIALS ===== */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
              Real Families · Real Mysuru Localities
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted By Bengaluru & Global Tech Professionals
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Hear from sons and daughters who rely on DearHand to care for their parents back home in Mysuru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "My 76-year-old mother lives alone in Gokulam. When she needed her cataract follow-up at Narayana Nethralaya, Suresh accompanied her, waited in the OPD line, and sent me photos of the eye drop schedule. Complete peace of mind.",
                author: "Vikram Deshpande",
                role: "Senior Engineering Manager, Bengaluru",
                locality: "Parents in Gokulam 3rd Stage",
                rating: 5
              },
              {
                quote: "Living in Indiranagar with back-to-back meetings made it impossible to drive down for every hospital visit. DearHand's helper Ramesh picked up my father's diabetes medication from Apollo and made sure appa took his lunch on time.",
                author: "Divya Narayan",
                role: "Product Architect, Bengaluru",
                locality: "Parents in Saraswathipuram",
                rating: 5
              },
              {
                quote: "Living in Singapore, sending cash or coordinating with local taxis was stressful. DearHand lets me pay via Razorpay and see photo proof when the helper walks my parents around Kukkarahalli Lake. Simply priceless.",
                author: "Raghuveer Kamath",
                role: "Tech Consultant, Singapore",
                locality: "Parents in Jayalakshmipuram",
                rating: 5
              }
            ].map((story, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(story.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    "{story.quote}"
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="font-extrabold text-slate-900 text-base">{story.author}</p>
                  <p className="text-xs font-semibold text-slate-500">{story.role}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3.5 h-3.5" />
                    {story.locality}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE FAQ ACCORDION ===== */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Got Questions?
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Everything you need to know about booking, helper qualifications, and safety in Mysuru.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 bg-white"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-base text-slate-900 hover:text-teal-700 transition-colors min-h-[52px]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      openFaqIndex === idx ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HIGH CONVERTING FINAL CTA ===== */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-800/80 text-teal-200 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-teal-700">
            <HeartHandshake className="w-4 h-4 text-teal-300" />
            Mysuru's Dedicated Elder Care Platform
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Give Your Parents The Caring Support They Deserve.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of families who enjoy everyday peace of mind. Book your first verified helper in under 3 minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => handleAction('single')}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all min-h-[48px]"
            >
              Book a Verified Helper Now <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
            <button
              onClick={onSignIn}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/90 hover:bg-slate-800 text-white font-bold text-base rounded-2xl border border-slate-700 transition-all min-h-[48px]"
            >
              Sign In to Your Account
            </button>
          </div>

          <p className="mt-6 text-xs text-teal-300 font-semibold">
            Need immediate assistance in Mysuru? Call Operations Support at +91 821 240 0199
          </p>
        </div>
      </section>

      {/* ===== SEO RICH FOOTER ===== */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 text-white font-black text-xl">
                <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                DearHand
              </div>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                Handpicked, police-verified companions for elderly parents in Mysuru. Founded to give children living in Bengaluru and abroad complete peace of mind.
              </p>
              <div className="mt-4 text-xs text-slate-500">
                Registered Office: 34 Kalidasa Road, Jayalakshmipuram, Mysuru, Karnataka 570012
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Care Services</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => handleAction('single')} className="hover:text-white transition">Hospital OPD Escort</button></li>
                <li><button onClick={() => handleAction('single')} className="hover:text-white transition">Medicine Pickup & Pharmacy</button></li>
                <li><button onClick={() => handleAction('half-day')} className="hover:text-white transition">Half-Day Companionship</button></li>
                <li><button onClick={() => handleAction('full-day')} className="hover:text-white transition">Full-Day Senior Stand-In</button></li>
                <li><button onClick={() => handleAction('single')} className="hover:text-white transition">Bank & Pension Assistance</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Service Areas in Mysuru</h4>
              <ul className="space-y-2 text-xs">
                <li><span>Jayalakshmipuram</span></li>
                <li><span>Gokulam (Stages 1, 2, 3)</span></li>
                <li><span>Saraswathipuram</span></li>
                <li><span>V.V. Mohalla & Yadavagiri</span></li>
                <li><span>Kuvempunagar & Hebbal</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Trust & Compliance</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Police Verified Vetting</li>
                <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-teal-500" /> 256-bit Razorpay Security</li>
                <li className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-teal-500" /> Photo & Geo Visit Audits</li>
                <li><span className="text-slate-500 mt-2 block">Support: care@dearhand.in</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>&copy; 2026 DearHand Technologies Pvt Ltd. All rights reserved.</p>
            <p>Designed with high-contrast accessibility & senior-friendly typography.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
