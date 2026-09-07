/**
 * Geospatial utility functions for worker matching and distance calculations
 */

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Number(distance.toFixed(2));
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate travel time (ETA) based on distance
 * Assumes average urban speed of 20 km/h
 * Returns estimated time in minutes
 */
export function estimateETA(distanceKm: number): number {
  const avgSpeedKmh = 20; // Average urban speed with traffic
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.ceil(timeHours * 60);
  
  return timeMinutes;
}

/**
 * Format distance for display
 * Returns string like "2.5 km" or "500 m"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Format ETA for display
 * Returns string like "15 mins" or "1 hr 30 mins"
 */
export function formatETA(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${remainingMins} mins`;
}

/**
 * Validate latitude/longitude coordinates
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Parse PostGIS POINT string to lat/lng object
 * Example input: "POINT(77.2090 28.6139)" -> {lat: 28.6139, lng: 77.2090}
 */
export function parsePostGISPoint(pointString: string): { lat: number; lng: number } | null {
  const match = pointString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!match) return null;
  
  return {
    lng: parseFloat(match[1]),
    lat: parseFloat(match[2]),
  };
}

/**
 * Create PostGIS POINT string from lat/lng
 * Example: {lat: 28.6139, lng: 77.2090} -> "POINT(77.2090 28.6139)"
 */
export function createPostGISPoint(lat: number, lng: number): string {
  return `POINT(${lng} ${lat})`;
}

/**
 * Calculate bounding box for a given point and radius
 * Useful for initial filtering before precise distance calculations
 * Returns {minLat, maxLat, minLng, maxLng}
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const latChange = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
  const lngChange = radiusKm / (111.32 * Math.cos(toRadians(lat)));
  
  return {
    minLat: lat - latChange,
    maxLat: lat + latChange,
    minLng: lng - lngChange,
    maxLng: lng + lngChange,
  };
}
