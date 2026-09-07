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
  google?: { maps: any };
};

let googleMapsLoader: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if ((window as GoogleMapsWindow).google?.maps) return Promise.resolve();
  if (googleMapsLoader) return googleMapsLoader;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));

  googleMapsLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.dataset.googleMaps = 'true';
    // Load Maps JS + Directions library
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=directions`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return googleMapsLoader;
}

export function GoogleMap({
  customer,
  worker,
  customerLabel = 'Your location',
  workerLabel = 'Worker',
}: GoogleMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapElement.current || !(window as GoogleMapsWindow).google) return;

        const maps = (window as GoogleMapsWindow).google!.maps;

        const map = new maps.Map(mapElement.current, {
          center: customer,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        });

        // Customer marker — blue pin
        new maps.Marker({
          map,
          position: customer,
          title: customerLabel,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#1a56db',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          zIndex: 2,
        });

        if (!worker) return;

        // Worker marker — red pin
        new maps.Marker({
          map,
          position: worker,
          title: workerLabel,
          icon: {
            path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            rotation: 0,
          },
          zIndex: 3,
        });

        // Draw driving route between worker and customer
        const directionsService = new maps.DirectionsService();
        const directionsRenderer = new maps.DirectionsRenderer({
          map,
          suppressMarkers: true, // we have custom markers above
          polylineOptions: {
            strokeColor: '#ef4444',
            strokeOpacity: 0.85,
            strokeWeight: 4,
          },
        });

        directionsService.route(
          {
            origin: worker,
            destination: customer,
            travelMode: maps.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (cancelled) return;
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
            } else {
              // Directions failed (e.g. quota) — just fit bounds with a line
              const bounds = new maps.LatLngBounds();
              bounds.extend(customer);
              bounds.extend(worker);
              map.fitBounds(bounds, 72);

              new maps.Polyline({
                map,
                path: [worker, customer],
                strokeColor: '#ef4444',
                strokeOpacity: 0.7,
                strokeWeight: 3,
                geodesic: true,
              });
            }
          }
        );
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
          <p className="mt-1 text-xs text-text-secondary">Add VITE_GOOGLE_MAPS_API_KEY to enable live map.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapElement}
      className="h-full min-h-[260px] w-full sm:min-h-[300px]"
      aria-label="Live worker location map"
    />
  );
}
