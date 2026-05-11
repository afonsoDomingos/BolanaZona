import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Deteção simples de Dispositivo e OS
    const ua = navigator.userAgent;
    const deviceType = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
    
    let os = 'Unknown';
    if (ua.indexOf('Win') !== -1) os = 'Windows';
    if (ua.indexOf('Android') !== -1) os = 'Android';
    if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';
    if (ua.indexOf('Mac') !== -1) os = 'MacOS';
    if (ua.indexOf('Linux') !== -1) os = 'Linux';

    // Registar visita
    api.post('/analytics/track', {
      type: 'visit',
      page: location.pathname,
      deviceType,
      os
    }).catch(() => {}); // Ignorar erros para não quebrar a UI
  }, [location.pathname]);

  return null;
}
