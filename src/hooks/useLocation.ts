import { useState, useEffect } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
}

const PUNE_DEFAULT: UserLocation = {
  lat: 18.5074,
  lng: 73.8077,
  address: 'Kothrud, Pune',
};

export function useLocation() {
  const [location, setLocation] = useState<UserLocation>(PUNE_DEFAULT);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('denied');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        // Reverse geocode using a free API
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const parts = [
            data.address?.suburb,
            data.address?.city || data.address?.town,
            data.address?.state,
          ].filter(Boolean);
          address = parts.join(', ') || address;
        } catch { /* ignore */ }
        setLocation({ lat, lng, address, accuracy });
        setStatus('granted');
      },
      () => {
        setStatus('denied');
        // Fall back to Pune
        setLocation(PUNE_DEFAULT);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  return { location, status, requestLocation };
}
