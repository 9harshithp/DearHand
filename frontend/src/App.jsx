import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HelperOnboardingPage from './pages/HelperOnboardingPage';
import AdminHelperVerificationPage from './pages/AdminHelperVerificationPage';
import AdminBookingsBoardPage from './pages/AdminBookingsBoardPage';
import AdminOperationsConsole from './pages/AdminOperationsConsole';
import ParentProfilesPage from './pages/ParentProfilesPage';
import NewBookingPage from './pages/NewBookingPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationBell from './components/NotificationBell';
import LandingPage from './components/LandingPage';
import {
  HeartHandshake,
  ShieldCheck,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

function Navigation({ activeView, setActiveView }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              DearHand
            </h1>
            <p className="text-xs font-semibold text-teal-700 mt-1 uppercase tracking-wider">
              Mysuru Pilot
            </p>
          </div>
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('home')}
            className={`px-3.5 py-2 rounded-xl text-base font-bold min-h-[44px] transition-colors ${
              activeView === 'home'
                ? 'bg-slate-100 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          {isAuthenticated ? (
            <>
              <NotificationBell
                onNavigateBookingDetail={(id) => {
                  setActiveView('booking-detail');
                }}
              />
              <button
                onClick={() => setActiveView('dashboard')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold min-h-[44px] transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard ({user?.name?.split(' ')[0]})
              </button>
              <button
                onClick={() => {
                  logout();
                  setActiveView('home');
                }}
                title="Sign Out"
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveView('login')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-bold min-h-[44px] transition-colors ${
                  activeView === 'login'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>

              <button
                onClick={() => setActiveView('register')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm min-h-[44px] transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Join
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('home');
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleOpenBookingDetail = useCallback((bookingId) => {
    setSelectedBookingId(bookingId);
    setActiveView('booking-detail');
  }, []);

  const handleCloseBookingDetail = useCallback(() => {
    setSelectedBookingId(null);
    setActiveView('dashboard');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navigation activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1">
        {activeView === 'home' && (
          <LandingPage
            onGetStarted={() => setActiveView(isAuthenticated ? 'new-booking' : 'register')}
            onSignIn={() => setActiveView('login')}
            onSelectPackage={() => setActiveView(isAuthenticated ? 'new-booking' : 'register')}
          />
        )}

        {activeView === 'login' && (
          isAuthenticated ? (
            <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Already signed in</h3>
              <p className="text-sm text-slate-600 mb-6">You are signed in as {user?.email}</p>
              <button
                onClick={() => setActiveView('dashboard')}
                className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl min-h-[44px]"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <LoginPage
              onNavigateRegister={() => setActiveView('register')}
              onSuccess={() => setActiveView('dashboard')}
            />
          )
        )}

        {activeView === 'register' && (
          isAuthenticated ? (
            <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Already registered</h3>
              <p className="text-sm text-slate-600 mb-6">You are signed in as {user?.email}</p>
              <button
                onClick={() => setActiveView('dashboard')}
                className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl min-h-[44px]"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <RegisterPage
              onNavigateLogin={() => setActiveView('login')}
              onSuccess={() => setActiveView('login')}
            />
          )
        )}

        {activeView === 'dashboard' && (
          <ProtectedRoute
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <DashboardPage
              onNavigateHelperOnboarding={() => setActiveView('helper-onboarding')}
              onNavigateAdminVerification={() => setActiveView('admin-verification')}
              onNavigateAdminBookings={() => setActiveView('admin-bookings')}
              onNavigateAdminOperations={() => setActiveView('admin-operations')}
              onNavigateNewBooking={() => setActiveView('new-booking')}
              onNavigateParents={() => setActiveView('parents')}
              onNavigateBookingDetail={handleOpenBookingDetail}
            />
          </ProtectedRoute>
        )}

        {activeView === 'admin-operations' && (
          <ProtectedRoute
            allowedRoles={['ADMIN']}
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <AdminOperationsConsole
              onBackToDashboard={() => setActiveView('dashboard')}
              onNavigateBookingDetail={handleOpenBookingDetail}
            />
          </ProtectedRoute>
        )}

        {activeView === 'admin-bookings' && (
          <ProtectedRoute
            allowedRoles={['ADMIN']}
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <AdminBookingsBoardPage
              onBackToDashboard={() => setActiveView('dashboard')}
              onNavigateBookingDetail={handleOpenBookingDetail}
            />
          </ProtectedRoute>
        )}

        {activeView === 'parents' && (
          <ProtectedRoute
            allowedRoles={['FAMILY', 'ADMIN']}
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <ParentProfilesPage
              onBack={() => setActiveView('dashboard')}
            />
          </ProtectedRoute>
        )}

        {activeView === 'new-booking' && (
          <ProtectedRoute
            allowedRoles={['FAMILY']}
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <NewBookingPage
              onBack={() => setActiveView('dashboard')}
              onNavigateAddParent={() => setActiveView('parents')}
              onBookingCreated={(id) => handleOpenBookingDetail(id)}
            />
          </ProtectedRoute>
        )}

        {activeView === 'booking-detail' && (
          <ProtectedRoute
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <BookingDetailPage
              bookingId={selectedBookingId}
              onBack={handleCloseBookingDetail}
            />
          </ProtectedRoute>
        )}

        {activeView === 'helper-onboarding' && (
          <ProtectedRoute
            allowedRoles={['HELPER', 'ADMIN']}
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <HelperOnboardingPage
              onBackToDashboard={() => setActiveView('dashboard')}
            />
          </ProtectedRoute>
        )}

        {activeView === 'admin-verification' && (
          <ProtectedRoute
            allowedRoles={['ADMIN']}
            onNavigateLogin={() => setActiveView('login')}
            onNavigateDashboard={() => setActiveView('dashboard')}
          >
            <AdminHelperVerificationPage
              onBackToDashboard={() => setActiveView('dashboard')}
            />
          </ProtectedRoute>
        )}
      </main>

      {activeView !== 'home' && (
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm font-semibold text-slate-500">
          DearHand Platform &copy; 2026 · Mysuru Pilot · Handpicked stand-ins for elderly parents
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
