'use client';

import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useMemo } from 'react';
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
}

export const MapView = ({ spots = [], onMarkerClick }: MapViewProps) => {
    const { location, loading, getLocation } = useGeolocation();
    const map = useMap(); // Access the map instance

    // Use Akihabara as the initial view, don't auto-pan to user location
    const initialCenter = DEFAULT_CENTER;

    const handleMyLocationClick = () => {
        if (location && map) {
            map.panTo(location);
            map.setZoom(16);
        } else {
            getLocation(); // Try to fetch again
        }
    };

    const getCoordinates = (locationString: string) => {
        // Expected format: "POINT(139.771250 35.699250)"
        try {
            const match = locationString.match(/POINT\(([\d\.]+) ([\d\.]+)\)/);
            if (match) {
                return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
            }
        } catch (e) {
            console.error("Error parsing location", locationString, e);
        }
        return null;
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

                    return (
                        <AdvancedMarker
                            key={spot.spot_id}
                            position={position}
                            onClick={() => onMarkerClick?.(spot)}
                        >
                            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
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
