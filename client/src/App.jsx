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
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Clubs from './pages/Clubs';
import Talents from './pages/Talents';
import Store from './pages/Store';
import AdminAnalytics from './pages/AdminAnalytics';
import Support from './pages/Support';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import MySquads from './pages/MySquads';
import SquadDetail from './pages/SquadDetail';
import TournamentList from './pages/TournamentList';
import TournamentNew from './pages/TournamentNew';
import TournamentDetail from './pages/TournamentDetail';
import PublicTournament from './pages/PublicTournament';
import Profile from './pages/Profile';
import GuideTournament from './pages/GuideTournament';
import UserManagement from './pages/UserManagement';
import AdminTeams from './pages/AdminTeams';
import Community from './pages/Community';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Cookies from './pages/legal/Cookies';
import CookieSettings from './pages/legal/CookieSettings';
import InviteAccept from './pages/InviteAccept';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <AnalyticsTracker />
      <CursorGlow />
      <ClickRipple />
      <main style={{ flex: 1, position: 'relative', zIndex: 2 }}>
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
          <Route path="/support" element={<Support />} />
          <Route path="/como-criar-torneio" element={<GuideTournament />} />
          <Route path="/community" element={<Community />} />
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/cookies" element={<Cookies />} />
          <Route path="/legal/cookie-settings" element={<CookieSettings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      {!isCommunityPage && <CommunityFAB />}
      <FeedbackPopup />
      {!isCommunityPage && <ShareAppPrompt />}
      <ScrollToTop />
      <SocialFAB />
      {!isCommunityPage && <InstallPrompt />}
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
