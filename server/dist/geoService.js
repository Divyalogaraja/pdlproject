// Haversine formula to compute distance between two [lat, lng] points in km
export function calculateDistanceKm(coord1, coord2) {
    const R = 6371; // Earth radius in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLng = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
}
// Bounding box calculation for a polygon
export function getBoundingBox(coords) {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const [lat, lng] of coords) {
        if (lat < minLat)
            minLat = lat;
        if (lat > maxLat)
            maxLat = lat;
        if (lng < minLng)
            minLng = lng;
        if (lng > maxLng)
            maxLng = lng;
    }
    return { minLat, maxLat, minLng, maxLng };
}
// Bounding box intersection check
export function checkBoundingBoxOverlap(box1, box2) {
    const overlapLat = Math.max(0, Math.min(box1.maxLat, box2.maxLat) - Math.max(box1.minLat, box2.minLat));
    const overlapLng = Math.max(0, Math.min(box1.maxLng, box2.maxLng) - Math.max(box1.minLng, box2.minLng));
    if (overlapLat > 0 && overlapLng > 0) {
        const intersectionBoxArea = overlapLat * overlapLng;
        const box1Area = (box1.maxLat - box1.minLat) * (box1.maxLng - box1.minLng);
        const ratio = box1Area > 0 ? (intersectionBoxArea / box1Area) : 0;
        return { overlaps: true, areaRatio: Math.min(ratio, 1.0) };
    }
    return { overlaps: false, areaRatio: 0 };
}
export function detectProjectOverlaps(targetProject, existingProjects) {
    const overlappingProjects = [];
    for (const existing of existingProjects) {
        if (targetProject.id && existing.id === targetProject.id)
            continue;
        const distanceKm = calculateDistanceKm(targetProject.centroid, existing.centroid);
        // If both have boundary coordinates, perform polygon bounding box intersection
        if (targetProject.boundary?.coordinates && existing.boundary?.coordinates) {
            const boxTarget = getBoundingBox(targetProject.boundary.coordinates);
            const boxExisting = getBoundingBox(existing.boundary.coordinates);
            const { overlaps, areaRatio } = checkBoundingBoxOverlap(boxTarget, boxExisting);
            if (overlaps && areaRatio > 0.01) {
                const pct = Math.round(areaRatio * 1000) / 10;
                const overlapHa = Math.round(targetProject.areaHectares * (pct / 100));
                let severity = 'Low';
                if (pct > 25)
                    severity = 'Critical';
                else if (pct > 10)
                    severity = 'Moderate';
                overlappingProjects.push({
                    projectId: existing.id,
                    projectName: existing.name,
                    overlapHectares: overlapHa,
                    overlapPercentage: pct,
                    severity,
                    centroidDistanceKm: distanceKm,
                    notes: `Detected ${pct}% boundary overlap (${overlapHa} ha) with registered project ${existing.id}. Centroids are separated by ${distanceKm} km.`
                });
                continue;
            }
        }
        // Centroid proximity fallback if boundary polygon is missing or simplified
        // If distance is very close (< 5 km), flag preliminary proximity notice
        if (distanceKm < 5.0) {
            overlappingProjects.push({
                projectId: existing.id,
                projectName: existing.name,
                overlapHectares: Math.round(targetProject.areaHectares * 0.05),
                overlapPercentage: 5.0,
                severity: 'Low',
                centroidDistanceKm: distanceKm,
                notes: `Close geographic proximity: Centroids are within ${distanceKm} km. Verify boundary perimeter to ensure distinct coastal concession.`
            });
        }
    }
    const hasOverlap = overlappingProjects.length > 0;
    const summary = hasOverlap
        ? `Warning: Potential geographic overlap detected with ${overlappingProjects.length} existing project(s). Does not immediately indicate fraud; manual verifier boundary confirmation recommended.`
        : `Geospatial perimeter check clear. No overlapping project claims found within geographic proximity.`;
    return {
        hasOverlap,
        overlappingProjects,
        summary
    };
}
