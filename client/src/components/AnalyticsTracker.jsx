import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Registar visita
    api.post('/analytics/track', {
      type: 'visit',
      page: location.pathname
    }).catch(() => {}); // Ignorar erros para não quebrar a UI
  }, [location.pathname]);

  return null;
}
