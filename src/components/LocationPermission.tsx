import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  status: 'idle' | 'requesting' | 'granted' | 'denied';
  address: string;
  onRequest: () => void;
}

export function LocationPermission({ status, address, onRequest }: Props) {
  if (status === 'granted') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2">
        <Navigation size={14} className="shrink-0 text-green-600" />
        <span className="text-xs font-medium text-green-700 line-clamp-1">{address}</span>
      </div>
    );
  }

  if (status === 'requesting') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-status-subtle bg-[#F7F7F7] px-3 py-2">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <span className="text-xs text-text-secondary">Getting your location...</span>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-status-subtle bg-[#F7F7F7] px-3 py-2">
        <MapPin size={14} className="shrink-0 text-text-tertiary" />
        <span className="text-xs text-text-secondary">{address}</span>
        <span className="ml-auto font-mono text-[9px] text-text-tertiary">DEMO</span>
      </div>
    );
  }

  return (
    <button
      onClick={onRequest}
      className="flex items-center gap-2 rounded-xl border border-accent-primary/30 bg-accent-light/30 px-3 py-2 transition hover:bg-accent-light/50"
    >
      <MapPin size={14} className="shrink-0 text-accent-primary" />
      <span className="text-xs font-semibold text-accent-primary">Allow location access</span>
    </button>
  );
}
