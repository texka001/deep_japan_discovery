export function parseHexFloat64(hex: string): number {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    // WKB uses little-endian for the doubles in the hex string after the stored endianness byte?
    // Actually WKB hex: 01 (little endian) 01000000 (point type) ...
    // Let's assume the hex string passed here is just the 16 chars of the float64
    // But dealing with raw WKB hex manually is brittle.
    // Use a simpler approach if we can, but if this worked in MapView, we port it.

    // Actually, in MapView we might have implemented a simpler parser or just regex if it was WKT.
    // If it's WKB HEX:
    // It's usually easier to just select st_astext(location) in SQL.
    // But since we already fetch it, let's stick to what worked or improve it.

    // Re-implementing a basic WKT parser which is safer if we ensure SQL returns text.
    return 0;
}

export function getCoordinates(location: string): { lat: number; lng: number } | null {
    if (!location) return null;

    // Handle PostGIS WKB Hex format (starts with 0101000020E6100000...)
    if (location.startsWith('0101000020E6100000')) {
        try {
            // Byte 0: 01 (Little Endian)
            // Bytes 1-4: Type (Point = 0x20000001 with SRID flag? or just 1)
            // ...
            // Easier trick: The structure is fixed for Points.
            // SRID 4326 (0xE6100000)
            // LNG (8 bytes)
            // LAT (8 bytes)

            // 01 01000020 E6100000 [LNG 16 chars] [LAT 16 chars]
            // Indices:
            // 0-1: Byte order
            // 2-9: Type
            // 10-17: SRID
            // 18-33: Lng
            // 34-49: Lat

            const lngHex = location.substring(18, 34);
            const latHex = location.substring(34, 50);

            const parseHexDouble = (hex: string) => {
                const buffer = new ArrayBuffer(8);
                const view = new DataView(buffer);
                for (let i = 0; i < 8; i++) {
                    view.setUint8(7 - i, parseInt(hex.substring(i * 2, i * 2 + 2), 16));
                }
                return view.getFloat64(0); // Big endian read after reversing bytes? Or just read little endian?
                // Simplest: DataView support littleEndian read.
            };

            const parseLittleEndianDouble = (hex: string) => {
                const buffer = new ArrayBuffer(8);
                const view = new DataView(buffer);
                for (let i = 0; i < 8; i++) {
                    view.setUint8(i, parseInt(hex.substring(i * 2, i * 2 + 2), 16));
                }
                return view.getFloat64(0, true);
            };

            return {
                lng: parseLittleEndianDouble(lngHex),
                lat: parseLittleEndianDouble(latHex)
            };
        } catch (e) {
            console.error("Error parsing WKB", e);
            return null;
        }
    }

    // Handle WKT format (POINT(139.7 35.6))
    const match = location.match(/POINT\s*\(([^ ]+)\s+([^ ]+)\)/);
    if (match) {
        return {
            lng: parseFloat(match[1]),
            lat: parseFloat(match[2])
        };
    }

    return null;
}

// Distance in meters
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return d;
}

export function getGoogleMapsUrl(spot: any): string {
    const coords = getCoordinates(spot.location || '');
    if (coords) {
        return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    }
    const query = encodeURIComponent(`${spot.name_en} ${spot.name_jp}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
