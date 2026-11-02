/**
 * Calculate the great-circle distance between two points on Earth using Haversine formula
 * @param {[number, number]} coord1 [longitude, latitude]
 * @param {[number, number]} coord2 [longitude, latitude]
 * @returns {number} Distance in kilometers
 */
export const calculateDistanceKm = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10; // 1 decimal place
};

