import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AnalyticsTracker from './components/AnalyticsTracker';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import Footer from './components/Footer';
import FeedbackPopup from './components/FeedbackPopup';
import ShareAppPrompt from './components/ShareAppPrompt';
import CommunityFAB from './components/CommunityFAB';
import SocialFAB from './components/SocialFAB';
import ProtectedRoute from './components/ProtectedRoute';
import CursorGlow from './components/CursorGlow';
import ClickRipple from './components/ClickRipple';
import OfflineIndicator from './components/OfflineIndicator';
import WelcomeMessage from './components/WelcomeMessage';

// Static import for Landing page to avoid initial flicker
import Landing from './pages/Landing';

// Lazy load other pages to optimize initial bundle size
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const Clubs = lazy(() => import('./pages/Clubs'));
const Talents = lazy(() => import('./pages/Talents'));
const Store = lazy(() => import('./pages/Store'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const Support = lazy(() => import('./pages/Support'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const MySquads = lazy(() => import('./pages/MySquads'));
const SquadDetail = lazy(() => import('./pages/SquadDetail'));
const TournamentList = lazy(() => import('./pages/TournamentList'));
const TournamentNew = lazy(() => import('./pages/TournamentNew'));
const TournamentDetail = lazy(() => import('./pages/TournamentDetail'));
const PublicTournament = lazy(() => import('./pages/PublicTournament'));
const Profile = lazy(() => import('./pages/Profile'));
const GuideTournament = lazy(() => import('./pages/GuideTournament'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const AdminTeams = lazy(() => import('./pages/AdminTeams'));
const AdminPartners = lazy(() => import('./pages/AdminPartners'));
const AdminShorts = lazy(() => import('./pages/AdminShorts'));
const Community = lazy(() => import('./pages/Community'));
const AdminStore = lazy(() => import('./pages/AdminStore'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Cookies = lazy(() => import('./pages/legal/Cookies'));
const CookieSettings = lazy(() => import('./pages/legal/CookieSettings'));
const InviteAccept = lazy(() => import('./pages/InviteAccept'));

import './index.css';

// Bola na Zona - Plataforma Oficial ⚽

// Helper route for guests only
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  return user ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  const location = useLocation();
  const isCommunityPage = location.pathname === '/community';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, []);

  // O WelcomeMessage agora gere o seu próprio sessionStorage interno e posição.

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <AnalyticsTracker />
      <CursorGlow />
      <ClickRipple />
      <main style={{ flex: 1, position: 'relative', zIndex: 2 }}>
        <Suspense fallback={<div className="loading-center"><div className="spinner" /></div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/talents" element={<Talents />} />
            <Route path="/shop" element={<Store />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            <Route path="/t/:shareCode" element={<PublicTournament />} />
            <Route path="/invite/team/:code" element={<InviteAccept />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/squads" element={<ProtectedRoute><MySquads /></ProtectedRoute>} />
            <Route path="/dashboard/squads/:id" element={<ProtectedRoute><SquadDetail /></ProtectedRoute>} />
            <Route path="/dashboard/tournaments" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
            <Route path="/dashboard/tournaments/new" element={<ProtectedRoute><TournamentNew /></ProtectedRoute>} />
            <Route path="/dashboard/tournaments/:id" element={<ProtectedRoute><TournamentDetail /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['superadmin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/teams" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminTeams /></ProtectedRoute>} />
            <Route path="/admin/partners" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminPartners /></ProtectedRoute>} />
            <Route path="/admin/shorts" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminShorts /></ProtectedRoute>} />
            <Route path="/admin/store" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminStore /></ProtectedRoute>} />
            <Route path="/support" element={<Support />} />
            <Route path="/como-criar-torneio" element={<GuideTournament />} />
            <Route path="/community" element={<Community />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/cookies" element={<Cookies />} />
            <Route path="/legal/cookie-settings" element={<CookieSettings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      {!isCommunityPage && <CommunityFAB />}
      <WelcomeMessage />
      <FeedbackPopup />
      {!isCommunityPage && <ShareAppPrompt />}
      <ScrollToTop />
      <SocialFAB />
      {!isCommunityPage && <InstallPrompt />}
      <OfflineIndicator />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0d1529', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
          success: { iconTheme: { primary: '#00C853', secondary: '#000' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
