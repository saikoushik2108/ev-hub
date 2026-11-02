import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Zap } from 'lucide-react';

const defaultCenter = [78.3820, 17.4474]; // Hyderabad IT Corridor (HITEC City)

const StationMap = ({
  stations = [],
  selectedStation,
  onSelectStation,
  userLocation,
  center = defaultCenter,
  zoom = 12,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Map initialization
  useEffect(() => {
    if (map.current) return;

    const styleUrl =
      import.meta.env.VITE_MAP_STYLE_URL ||
      'https://tiles.openfreemap.org/styles/dark';

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: userLocation || center,
      zoom: zoom,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );
  }, []);

  // Update center when center prop changes
  useEffect(() => {
    if (map.current && center) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        essential: true,
      });
    }
  }, [center, zoom]);

  // Render User Location Blue/Green Pin
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4FACFE';
    el.style.border = '3px solid #ffffff';
    el.style.boxShadow = '0 0 16px rgba(79, 172, 254, 0.8)';

    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map.current);
  }, [userLocation]);

  // Render Custom Station Markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing station markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    stations.forEach((station) => {
      if (!station.location?.coordinates || station.location.coordinates.length < 2) return;

      const [lng, lat] = station.location.coordinates;
      const status = (station.availabilityStatus || 'GREEN').toLowerCase();

      // Create Custom Marker DOM Element
      const el = document.createElement('div');
      el.className = 'maplibre-marker-container';

      const inner = document.createElement('div');
      inner.className = `ev-marker ${status}`;

      // Insert lightning bolt icon
      inner.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#090B0A" stroke="#090B0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      `;

      el.appendChild(inner);

      // Price / kW Badge below marker
      const label = document.createElement('div');
      label.style.backgroundColor = '#090B0A';
      label.style.border = '1px solid var(--border-subtle)';
      label.style.color = '#F2F5F2';
      label.style.padding = '2px 6px';
      label.style.borderRadius = '4px';
      label.style.fontSize = '10px';
      label.style.fontWeight = '700';
      label.style.marginTop = '2px';
      label.style.textAlign = 'center';
      label.style.whiteSpace = 'nowrap';
      label.innerText = `₹${station.price}/${station.priceUnit || 'kWh'}`;
      el.appendChild(label);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectStation?.(station);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [stations, onSelectStation]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
};

export default StationMap;

