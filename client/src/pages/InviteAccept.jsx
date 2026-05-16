import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Shield, Check, Loader } from 'lucide-react';

export default function InviteAccept() {
  const { code } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error('Precisas de estar logado para aceitar um convite.');
      // Guardar o URL para voltar após o login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const accept = async () => {
      setProcessing(true);
      try {
        const res = await api.post(`/teams/accept-invite/${code}`);
        toast.success('Convite aceite! Agora geres esta equipa. 🎉');
        navigate('/dashboard/squads');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Erro ao processar convite.');
        navigate('/dashboard/squads');
      } finally {

        setProcessing(false);
      }
    };

    accept();
  }, [code, user, authLoading, navigate]);

  return (
    <div className="page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card-premium" style={{ maxWidth: 400, textAlign: 'center', padding: 40 }}>
        <div className="card-icon-main" style={{ margin: '0 auto 24px', background: 'var(--green-subtle)', color: 'var(--green)' }}>
          <Shield size={32} />
        </div>
        
        <h1 className="font-syne" style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
          A Processar Convite...
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          Estamos a vincular a tua conta à gestão da equipa. Por favor, aguarda um momento.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      </div>
    </div>
  );
}
