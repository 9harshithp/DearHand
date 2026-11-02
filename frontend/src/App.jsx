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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 sm:gap-3 text-left focus:outline-none flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-11 sm:h-11 bg-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <HeartHandshake className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none block">
              DearHand
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-teal-700 uppercase tracking-wider block">
              Mysuru Pilot
            </span>
          </div>
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Desktop-only Home link */}
          <button
            onClick={() => setActiveView('home')}
            className={`hidden md:inline-flex px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
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
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
                  activeView === 'dashboard'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Dashboard ({user?.name?.split(' ')[0]})</span>
                <span className="sm:hidden">Dashboard</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setActiveView('home');
                }}
                title="Sign Out"
                className="p-1.5 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveView('login')}
                className={`inline-flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
                  activeView === 'login'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => setActiveView('register')}
                className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Join</span>
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
