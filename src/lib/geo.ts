// Approximate centroids for 20 Jaipur wards
// geojsonId must match geojson_id in public.wards table
const WARD_CENTROIDS = [
  { geojsonId: 'ward_1',  lat: 26.9124, lng: 75.7403 }, // Vaishali Nagar
  { geojsonId: 'ward_2',  lat: 26.8627, lng: 75.7619 }, // Mansarovar
  { geojsonId: 'ward_3',  lat: 26.8590, lng: 75.8117 }, // Malviya Nagar
  { geojsonId: 'ward_4',  lat: 26.8050, lng: 75.8503 }, // Jagatpura
  { geojsonId: 'ward_5',  lat: 26.8271, lng: 75.7987 }, // Sanganer
  { geojsonId: 'ward_6',  lat: 26.8414, lng: 75.8352 }, // Pratap Nagar
  { geojsonId: 'ward_7',  lat: 26.9239, lng: 75.8267 }, // Pink City
  { geojsonId: 'ward_8',  lat: 26.9191, lng: 75.8089 }, // Civil Lines
  { geojsonId: 'ward_9',  lat: 26.8979, lng: 75.7741 }, // Bajaj Nagar
  { geojsonId: 'ward_10', lat: 26.8840, lng: 75.7571 }, // Nirman Nagar
  { geojsonId: 'ward_11', lat: 26.9592, lng: 75.7511 }, // Jhotwara
  { geojsonId: 'ward_12', lat: 26.9099, lng: 75.8003 }, // Shyam Nagar
  { geojsonId: 'ward_13', lat: 26.9153, lng: 75.8228 }, // Raja Park
  { geojsonId: 'ward_14', lat: 26.8700, lng: 75.8050 }, // Tonk Road
  { geojsonId: 'ward_15', lat: 26.7773, lng: 75.8562 }, // Sitapura
  { geojsonId: 'ward_16', lat: 26.8653, lng: 75.8108 }, // Durgapura
  { geojsonId: 'ward_17', lat: 26.9501, lng: 75.7897 }, // Vidhyadhar Nagar
  { geojsonId: 'ward_18', lat: 26.9019, lng: 75.7862 }, // Sodala
  { geojsonId: 'ward_19', lat: 26.9612, lng: 75.7695 }, // Murlipura
  { geojsonId: 'ward_20', lat: 26.9297, lng: 75.7954 }, // Banipark
]

/**
 * Returns the geojsonId of the nearest ward to the given GPS coordinates.
 * Uses squared Euclidean distance — fine for small areas like a city.
 */
export function findNearestWardGeojsonId(lat: number, lng: number): string {
  return WARD_CENTROIDS.reduce((nearest, ward) => {
    const d  = (ward.lat - lat) ** 2 + (ward.lng - lng) ** 2
    const nd = (nearest.lat - lat) ** 2 + (nearest.lng - lng) ** 2
    return d < nd ? ward : nearest
  }).geojsonId
}

/**
 * Requests the device GPS position.
 * Resolves to null on denial or timeout instead of rejecting —
 * callers can degrade gracefully (no ward pre-fill).
 */
export function getGpsPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()  => resolve(null),
      { timeout: 5000, maximumAge: 30_000 }
    )
  })
}
