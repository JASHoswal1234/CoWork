import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export type MapCoordinate = {
  lat: number;
  lng: number;
};

type GoogleMapProps = {
  customer: MapCoordinate;
  worker?: MapCoordinate;
  customerLabel?: string;
  workerLabel?: string;
};

type GoogleMapsWindow = Window & {
  google?: {
    maps: any;
  };
};

let googleMapsLoader: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if ((window as GoogleMapsWindow).google?.maps) return Promise.resolve();
  if (googleMapsLoader) return googleMapsLoader;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));

  googleMapsLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.dataset.googleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return googleMapsLoader;
}

export function GoogleMap({ customer, worker, customerLabel = 'Your location', workerLabel = 'Worker' }: GoogleMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapElement.current || !(window as GoogleMapsWindow).google) return;

        const maps = (window as GoogleMapsWindow).google!.maps;
        const points = worker ? [customer, worker] : [customer];
        const bounds = new maps.LatLngBounds();
        points.forEach((point) => bounds.extend(point));
        const map = new maps.Map(mapElement.current, {
          center: customer,
          zoom: worker ? undefined : 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });

        new maps.Marker({ map, position: customer, title: customerLabel, label: 'Y' });
        if (worker) {
          new maps.Marker({ map, position: worker, title: workerLabel, label: 'W' });
          map.fitBounds(bounds, 72);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [customer, worker, customerLabel, workerLabel]);

  if (error) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center bg-[#eaf1f8] px-6 text-center sm:min-h-[300px]">
        <div>
          <MapPin className="mx-auto text-accent-primary" size={28} />
          <p className="mt-3 text-sm font-semibold text-text-navy">Map unavailable</p>
          <p className="mt-1 text-xs text-text-secondary">Add VITE_GOOGLE_MAPS_API_KEY to the frontend .env file.</p>
        </div>
      </div>
    );
  }

  return <div ref={mapElement} className="h-full min-h-[260px] w-full sm:min-h-[300px]" aria-label="Live worker location map" />;
}