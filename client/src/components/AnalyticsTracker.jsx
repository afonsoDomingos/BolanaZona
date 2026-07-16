import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CountUp = ({ end }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500; // 1.5s para contar
    const steps = 60;
    const increment = end / steps;
    const interval = duration / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count}</span>;
};

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

    // Registar visita com um pequeno atraso para garantir que o servidor está "acordado"
    const timer = setTimeout(() => {
      const isNew = !localStorage.getItem('bnz_visitor_id');
      if (isNew) {
        const visitorId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('bnz_visitor_id', visitorId);
      }

      api.post('/analytics/track', {
        type: 'visit',
        page: location.pathname,
        deviceType,
        os,
        isNewVisitor: isNew
      }).then(res => {
        if (res.data.visitorNumber) {
          localStorage.setItem('bnz_visitor_number', res.data.visitorNumber);
          
          // Disparar evento global para atualizar o contador fixo
          window.dispatchEvent(new CustomEvent('bnz-visit-tracked', {
            detail: { visitorNumber: res.data.visitorNumber }
          }));
        }
      }).catch(() => {});
    }, 2000); // 2 segundos de espera

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}
