import { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function ChallengeMap({ location, mapsLink, city }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Default center (Mozambique/Maputo)
    const defaultCoords = [-25.9692, 32.5732]; 
    
    // Try to extract coordinates from Google Maps link
    let coords = defaultCoords;
    if (mapsLink) {
      const match = mapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        coords = [parseFloat(match[1]), parseFloat(match[2])];
      }
    }

    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerRef.current).setView(coords, 15);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);

      // Custom Football Ball Icon
      const ballIcon = window.L.divIcon({
        html: '<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))">⚽</div>',
        className: 'custom-ball-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      window.L.marker(coords, { icon: ballIcon }).addTo(mapRef.current)
        .bindPopup(`<b>${location}</b><br>${city || ''}`)
        .openPopup();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [location, mapsLink, city]);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location + ' ' + (city || 'Moçambique'))}`;

  return (
    <div style={{ marginTop: 16, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
      <div ref={mapContainerRef} style={{ height: 250, width: '100%' }} />
      <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <MapPin size={14} color="var(--green)" /> {location}
        </div>
        <a 
          href={directionsUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-primary btn-sm"
          style={{ height: 32, padding: '0 12px', background: 'var(--green)', color: '#000', border: 'none', fontSize: 12 }}
        >
          <Navigation size={14} /> Traçar Rota
        </a>
      </div>
    </div>
  );
}
