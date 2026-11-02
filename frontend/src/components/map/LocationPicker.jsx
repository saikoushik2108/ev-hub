import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultPos = [78.3820, 17.4474]; // Hyderabad

const LocationPicker = ({ initialLat = 17.4474, initialLng = 78.3820, onLocationChange }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [coords, setCoords] = useState({
    lat: initialLat || defaultPos[1],
    lng: initialLng || defaultPos[0],
  });

  useEffect(() => {
    if (map.current) return;

    const styleUrl =
      import.meta.env.VITE_MAP_STYLE_URL ||
      'https://tiles.openfreemap.org/styles/dark';

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [coords.lng, coords.lat],
      zoom: 13,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Create draggable marker
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="background: #39F28A; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(57,242,138,0.8); border: 2px solid #090B0A; cursor: grab;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#090B0A" stroke="#090B0A" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#39F28A"/></svg>
      </div>
    `;

    marker.current = new maplibregl.Marker({ element: el, draggable: true })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current.getLngLat();
      const newPos = {
        lat: Math.round(lngLat.lat * 100000) / 100000,
        lng: Math.round(lngLat.lng * 100000) / 100000,
      };
      setCoords(newPos);
      onLocationChange?.(newPos);
    });

    // Map click moves marker
    map.current.on('click', (e) => {
      const newPos = {
        lat: Math.round(e.lngLat.lat * 100000) / 100000,
        lng: Math.round(e.lngLat.lng * 100000) / 100000,
      };
      marker.current.setLngLat([newPos.lng, newPos.lat]);
      setCoords(newPos);
      onLocationChange?.(newPos);
    });
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: Math.round(pos.coords.latitude * 100000) / 100000,
          lng: Math.round(pos.coords.longitude * 100000) / 100000,
        };
        setCoords(newPos);
        marker.current.setLngLat([newPos.lng, newPos.lat]);
        map.current.flyTo({ center: [newPos.lng, newPos.lat], zoom: 15 });
        onLocationChange?.(newPos);
        toast.success('Pin placed at your current location!');
      },
      (err) => {
        toast.error('Unable to retrieve your current location.');
      }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Floating control bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          backgroundColor: 'rgba(9, 11, 10, 0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.825rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="var(--primary-green)" />
          <span>
            Lat: <strong>{coords.lat}</strong>, Lng: <strong>{coords.lng}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          <Navigation size={13} />
          Use GPS
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;

