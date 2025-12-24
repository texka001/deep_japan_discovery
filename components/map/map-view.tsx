'use client';

import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';

const DEFAULT_CENTER = { lat: 35.698379, lng: 139.773099 }; // Akihabara

type Spot = {
    spot_id: string;
    name_en: string;
    location: string;
};

interface MapViewProps {
    spots?: Spot[];
    onMarkerClick?: (spot: Spot) => void;
    selectedSpotId?: string | null;
}

export const MapView = ({ spots = [], onMarkerClick, selectedSpotId }: MapViewProps) => {
    const { location, loading, getLocation } = useGeolocation();
    const map = useMap(); // Access the map instance

    // Use Akihabara as the initial view, don't auto-pan to user location
    const initialCenter = DEFAULT_CENTER;

    const parseHexFloat64 = (hex: string) => {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        // Hex is 16 chars. Parse pairs.
        // PostGIS WKB is Little Endian (01).
        // Example Hex: 848E17A14A786140 -> Double
        // Provide bytes in reverse order for Big Endian DataView setResponse? 
        // Or just set byte by byte.
        for (let i = 0; i < 8; i++) {
            const byteVal = parseInt(hex.substr(i * 2, 2), 16);
            view.setUint8(i, byteVal);
        }
        return view.getFloat64(0, true); // true for littleEndian
    };

    const getCoordinates = (locationString: string) => {
        if (!locationString) return null;

        // CHECK FOR HEX FORMAT (PostGIS WKB)
        // Starts with 0101000020E6100000 (18 chars header for Point 4326)
        if (locationString.startsWith('0101000020E6100000')) {
            try {
                // Header (18 chars) + Lng (16 chars) + Lat (16 chars)
                const lngHex = locationString.substr(18, 16);
                const latHex = locationString.substr(34, 16);

                const lng = parseHexFloat64(lngHex);
                const lat = parseHexFloat64(latHex);
                return { lat, lng };
            } catch (e) {
                console.error("Error parsing hex location", e);
            }
        }

        // CHECK FOR WKT FORMAT "POINT(lng lat)"
        try {
            const match = locationString.match(/POINT\(([\d\.-]+) ([\d\.-]+)\)/); // Added minus for negative coords
            if (match) {
                return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
            }
        } catch (e) {
            console.error("Error parsing WKT location", locationString, e);
        }
        return null;
    };

    // Pan to selected spot
    useEffect(() => {
        if (!map || !selectedSpotId || !spots) return;
        const spot = spots.find(s => s.spot_id === selectedSpotId);
        if (spot) {
            const coords = getCoordinates(spot.location);
            if (coords) {
                map.panTo(coords);
                map.setZoom(16);
            }
        }
    }, [map, selectedSpotId, spots]);

    const handleMyLocationClick = () => {
        if (location && map) {
            map.panTo(location);
            map.setZoom(16);
        } else {
            getLocation(); // Try to fetch again
        }
    };

    return (
        <div className="w-full h-full min-h-[400px] relative">
            <Map
                defaultZoom={15}
                defaultCenter={initialCenter}
                mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
                className="w-full h-full"
                gestureHandling={'greedy'}
                disableDefaultUI={true}
            >
                {location && (
                    <AdvancedMarker position={location}>
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-animation" />
                    </AdvancedMarker>
                )}

                {spots.map((spot) => {
                    const position = getCoordinates(spot.location);
                    if (!position) return null;
                    const isSelected = spot.spot_id === selectedSpotId;

                    return (
                        <AdvancedMarker
                            key={spot.spot_id}
                            position={position}
                            onClick={() => onMarkerClick?.(spot)}
                            zIndex={isSelected ? 10 : 1}
                        >
                            <Pin
                                background={isSelected ? '#EA4335' : '#FBBC04'}
                                glyphColor={'#000'}
                                borderColor={'#000'}
                                scale={isSelected ? 1.2 : 1.0}
                            />
                        </AdvancedMarker>
                    );
                })}
            </Map>

            {/* My Location Button - Always Visible */}
            <div className="absolute top-32 right-4 md:bottom-24 md:right-8 md:top-auto z-10">
                <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg bg-white/90 hover:bg-white w-12 h-12"
                    onClick={handleMyLocationClick}
                    title={location ? "Go to my location" : "Find my location"}
                >
                    <Locate className={`w-6 h-6 ${location ? 'text-blue-500' : 'text-gray-500'}`} />
                </Button>
            </div>

            {loading && (
                <div className="absolute top-20 left-4 bg-white/80 p-2 rounded shadow text-xs backdrop-blur-md">
                    Retrieving location...
                </div>
            )}
        </div>
    );
};
