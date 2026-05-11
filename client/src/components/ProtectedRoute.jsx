import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  if (!user) {
    // Redirecionar para login mas guardar a página onde tentou entrar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Se não tiver permissão, volta para o dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
