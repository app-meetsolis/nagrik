# Future Improvements

## Ward Map — Real GeoJSON Boundaries (Option C)

**What:** Replace the placeholder circle bubbles on `/map` with actual Jaipur ward polygon boundaries,
making it a proper choropleth map (wards filled by score color).

**Current state:** Circles at hardcoded centroids in `src/app/map/WardMap.tsx` (CENTROIDS constant).

**What needs to happen:**

1. **Get real GeoJSON** — Download actual Jaipur ward boundaries.
   - Source: OpenStreetMap via https://overpass-turbo.eu
   - Query: `relation["admin_level"="10"]["name:en"~"Ward"][within:Jaipur]`
   - Export as GeoJSON.
   - Alternative: data.gov.in for official municipal boundaries.

2. **Map ward IDs** — The downloaded GeoJSON will have OSM feature IDs or ward numbers.
   You need to match each polygon to our `geojson_id` values (`ward_1` through `ward_20`).
   This is manual work — compare ward names in the GeoJSON to the ward names in our DB.

3. **Replace the file** — Put the final GeoJSON at `public/geo/jaipur-wards.geojson`
   with each feature having `properties.id` = our `geojson_id` (e.g., `"ward_1"`).

4. **Switch WardMap to GeoJSON layer** — Replace `CircleMarker` with a `<GeoJSON>` layer
   styled by score. The old rectangle code is still in git history (commit before fd7ff55).

5. **Remove CENTROIDS constant** — Once real polygons are in, centroids are no longer needed.

**Files to change:**
- `public/geo/jaipur-wards.geojson` — replace with real boundaries
- `src/app/map/WardMap.tsx` — swap CircleMarker for GeoJSON layer

**Estimated effort:** 1–2 hours (mostly manual GeoJSON ID mapping).
