import { useState, useCallback, useRef } from 'react';
import { geospatialApi } from '../lib/api';

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  accuracy?: number;
}

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout' | 'error';

export interface UseLocationReturn {
  location: UserLocation | null;
  status: LocationStatus;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<UserLocation | null>;
  clearError: () => void;
  setLocation: (loc: UserLocation | null) => void;
}

export function useLocation(initialLocation: UserLocation | null = null): UseLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(initialLocation);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isRequestingRef = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
    if (status !== 'granted') {
      setStatus('idle');
    }
  }, [status]);

  const requestLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (isRequestingRef.current) {
      return null;
    }

    if (!navigator || !navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser.';
      setStatus('error');
      setError(errMsg);
      return null;
    }

    isRequestingRef.current = true;
    setStatus('requesting');
    setError(null);

    return new Promise<UserLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude: lat, longitude: lng, accuracy } = position.coords;
            let detectedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            let locality: string | undefined;
            let city: string | undefined;
            let state: string | undefined;
            let pincode: string | undefined;

            try {
              const res = await geospatialApi.reverseGeocode(lat, lng);
              if (res && res.address) {
                detectedAddress = res.address;
                locality = res.locality;
                city = res.city;
                state = res.state;
                pincode = res.pincode;
              }
            } catch (geoErr) {
              console.warn('Reverse geocode fallback to coordinates:', geoErr);
              detectedAddress = `Detected Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
            }

            const newLoc: UserLocation = {
              lat,
              lng,
              address: detectedAddress,
              locality,
              city,
              state,
              pincode,
              accuracy,
            };

            setLocation(newLoc);
            setStatus('granted');
            setError(null);
            isRequestingRef.current = false;
            resolve(newLoc);
          } catch (err: any) {
            console.error('Location processing error:', err);
            setStatus('error');
            setError('Failed to process detected location. Please enter your address manually.');
            isRequestingRef.current = false;
            resolve(null);
          }
        },
        (geoError: GeolocationPositionError) => {
          isRequestingRef.current = false;
          let userMessage = 'Unable to determine your current location. Please try again or enter your address manually.';
          let newStatus: LocationStatus = 'error';

          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              newStatus = 'denied';
              userMessage = 'Location permission was denied. Please allow location access in your browser settings and try again.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              newStatus = 'unavailable';
              userMessage = 'Unable to determine your current location. Please try again or enter your address manually.';
              break;
            case geoError.TIMEOUT:
              newStatus = 'timeout';
              userMessage = 'Location request timed out. Please try again.';
              break;
            default:
              newStatus = 'error';
              userMessage = 'Unable to retrieve location. Please check your device location settings.';
          }

          setStatus(newStatus);
          setError(userMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }, []);

  return {
    location,
    status,
    isLoading: status === 'requesting',
    error,
    requestLocation,
    clearError,
    setLocation,
  };
}
