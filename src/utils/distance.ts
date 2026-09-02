/**
 * Distance calculation utilities using Haversine formula
 * 
 * Validates Requirements: 12.1, 12.5
 */

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * 
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate distance between two coordinate objects
 */
export function calculateDistanceBetweenPoints(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  return calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);
}

/**
 * Format distance for display
 * @param km - Distance in kilometers
 * @returns Formatted string like "2.5 km" or "850 m"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estimate travel time based on distance
 * Assumes average speed of 20 km/h for urban travel
 * @param km - Distance in kilometers
 * @returns Estimated time in minutes
 */
export function estimateTravelTime(km: number): number {
  const avgSpeedKmPerHour = 20;
  const hours = km / avgSpeedKmPerHour;
  return Math.ceil(hours * 60);
}
