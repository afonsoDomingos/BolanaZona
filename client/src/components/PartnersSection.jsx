import { useEffect, useState } from 'react';
import api from '../services/api';

function PartnerLogo({ partner }) {
  if (partner.logo) {
    return (
      <img src={partner.logo} alt={partner.name} className="partner-logo-img" loading="lazy" />
    );
  }
  return <span className="partner-logo-fallback">{partner.name}</span>;
}

export default function PartnersSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/partners')
      .then(res => setPartners(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || partners.length === 0) return null;

  const track = [...partners, ...partners];

  return (
    <section className="partners-section">
      <div className="container">
        <div className="partners-section-header">
          <span className="partners-section-label">🤝 Parcerias</span>
          <h2 className="font-syne partners-section-title">Nossos Parceiros</h2>
          <p className="partners-section-subtitle">
            Marcas e plataformas que apoiam o futebol de base em Moçambique.
          </p>
        </div>
      </div>

      <div className="partners-marquee" aria-label="Logos dos parceiros">
        <div className="partners-marquee-track">
          {track.map((partner, i) => (
            <a
              key={`${partner._id}-${i}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-logo-card"
              title={partner.name}
            >
              <PartnerLogo partner={partner} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
