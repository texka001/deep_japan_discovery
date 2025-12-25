'use client';

import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useMemo, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';
import { getCoordinates } from '@/lib/location';
import { Spot, RouteLeg } from '@/types';

const DEFAULT_CENTER = { lat: 35.698379, lng: 139.773099 }; // Akihabara

interface MapViewProps {
    spots: Spot[];
    onMarkerClick: (spot: Spot) => void;
    selectedSpotId?: string;
    isRouteMode?: boolean;
    onRouteSpotSelect?: (spot: Spot) => void;
    selectedRouteSpots?: Spot[]; // Spots currently selected for route
    routePath?: Spot[]; // Calculated ordered path
    routeLegs?: RouteLeg[]; // Add support for detailed legs
    favoriteSpotIds?: Set<string>; // Set of favorite spot IDs
    onSearchArea?: (bounds: { north: number, south: number, east: number, west: number }) => void;
}

export const MapView = ({
    spots = [],
    onMarkerClick,
    selectedSpotId,
    isRouteMode,
    onRouteSpotSelect,
    selectedRouteSpots = [],
    routePath,
    routeLegs,
    favoriteSpotIds = new Set(),
    onSearchArea
}: MapViewProps) => {
    const { location, loading, getLocation } = useGeolocation();
    const map = useMap(); // Access the map instance
    const [showSearchAreaBtn, setShowSearchAreaBtn] = useState(false);
    const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);

    // Use Akihabara as the initial view, don't auto-pan to user location
    const initialCenter = DEFAULT_CENTER;

    // Pan to selected spot
    useEffect(() => {
        if (!map || !selectedSpotId || !spots) return;
        const spot = spots.find(s => s.spot_id === selectedSpotId);
        if (spot) {
            const coords = getCoordinates(spot.location || '');
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
            setShowSearchAreaBtn(false); // Reset button on reset view
        } else {
            getLocation(); // Try to fetch again
        }
    };

    // Listen for map moves
    useEffect(() => {
        if (!map) return;

        const listener = map.addListener('idle', () => {
            const bounds = map.getBounds();
            if (bounds) {
                setMapBounds(bounds);
                // Simple logic: Always show button when map moves if handler is present
                // Ideally we check if moved significant distance, but for now simple.
                if (onSearchArea) setShowSearchAreaBtn(true);
            }
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [map, onSearchArea]);

    const handleSearchAreaClick = () => {
        if (mapBounds && onSearchArea) {
            const ne = mapBounds.getNorthEast();
            const sw = mapBounds.getSouthWest();
            onSearchArea({
                north: ne.lat(),
                south: sw.lat(),
                east: ne.lng(),
                west: sw.lng()
            });
            setShowSearchAreaBtn(false);
        }
    };
    useEffect(() => {
        if (!map || !isRouteMode) return;

        // If we have detailed legs, use them
        if (routeLegs && routeLegs.length > 0) {
            const polylines: google.maps.Polyline[] = [];

            routeLegs.forEach((leg) => {
                if (!leg.polyline) return;

                const color = leg.mode === 'TRANSIT' ? '#2563EB' : '#EA4335';
                const path = google.maps.geometry.encoding.decodePath(leg.polyline);

                const line = new google.maps.Polyline({
                    path: path,
                    geodesic: true,
                    strokeColor: color,
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                    map: map,
                    icons: leg.mode === 'TRANSIT' ? [{
                        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
                        offset: '0',
                        repeat: '10px'
                    }] : undefined
                });
                polylines.push(line);
            });

            return () => {
                polylines.forEach(p => p.setMap(null));
            };
        }

        // Fallback: Straight lines
        else if (routePath && routePath.length > 1) {
            const path = routePath.map(s => {
                const c = getCoordinates(s.location || '');
                return c ? { lat: c.lat, lng: c.lng } : null;
            }).filter(c => c !== null) as google.maps.LatLngLiteral[];

            const routeLine = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 3,
                map: map,
            });

            return () => {
                routeLine.setMap(null);
            };
        }
    }, [map, routePath, routeLegs, isRouteMode]);

    // Auto-pan to start of route when route is loaded
    useEffect(() => {
        if (!map || !routePath || routePath.length === 0) return;

        // Pan to the first spot
        const startSpot = routePath[0];
        const coords = getCoordinates(startSpot.location || '');
        if (coords) {
            map.panTo(coords);
            map.setZoom(15);
            // Optionally fit bounds if we want to see whole route, but request was "center to start"
        }
    }, [map, routePath]);

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
                    const position = getCoordinates(spot.location || '');
                    if (!position) return null;
                    const isSelected = spot.spot_id === selectedSpotId;
                    const isFavorite = favoriteSpotIds.has(spot.spot_id);
                    // if (isFavorite) console.log("Rendering favorite spot:", spot.name_en);

                    // Route Selection State
                    const isRouteSelected = isRouteMode && selectedRouteSpots.some(s => s.spot_id === spot.spot_id);
                    const isStartPoint = routePath && routePath.length > 0 && routePath[0].spot_id === spot.spot_id;

                    // Determine visual style
                    let pinBackground = '#FBBC04'; // Default Yellow
                    let pinScale = 1.0;
                    let zIndex = 1;

                    // Route numbering
                    let routeIndex = -1;
                    if (isRouteMode && routePath && routePath.length > 0) {
                        routeIndex = routePath.findIndex(s => s.spot_id === spot.spot_id);
                    }

                    if (isRouteMode) {
                        if (isStartPoint || routeIndex === 0) {
                            pinBackground = '#0F9D58'; // Green for start
                            pinScale = 1.3;
                            zIndex = 20;
                        } else if (isRouteSelected || routeIndex > 0) {
                            pinBackground = '#4285F4'; // Blue for selected/route
                            pinScale = 1.1;
                            zIndex = 10;
                        } else {
                            pinBackground = '#9AA0A6'; // Gray for unselected in route mode
                            pinScale = 0.9;
                        }
                    } else {
                        if (isSelected) {
                            pinBackground = '#EA4335'; // Red
                            pinScale = 1.2;
                            zIndex = 10;
                        }
                    }

                    return (
                        <AdvancedMarker
                            key={spot.spot_id}
                            position={position}
                            onClick={() => {
                                if (isRouteMode && onRouteSpotSelect) {
                                    onRouteSpotSelect(spot);
                                } else {
                                    onMarkerClick?.(spot);
                                }
                            }}
                            zIndex={zIndex}
                        >
                            <Pin
                                background={pinBackground}
                                glyphColor={'#FFFFFF'}
                                borderColor={'#000'}
                                scale={pinScale}
                                glyph={
                                    routeIndex >= 0
                                        ? (routeIndex + 1).toString()
                                        : isFavorite
                                            ? "♥"
                                            : undefined
                                }
                            />
                        </AdvancedMarker>
                    );
                })}
            </Map>

            {/* My Location Button - Always Visible */}
            <div className="absolute top-32 right-4 md:bottom-24 md:right-8 md:top-auto z-10 flex flex-col gap-2">
                {/* Search Area Button */}
                {showSearchAreaBtn && !isRouteMode && (
                    <Button
                        variant="secondary"
                        className="rounded-full shadow-lg bg-white/90 hover:bg-white text-sm font-semibold mb-2 animate-in fade-in slide-in-from-bottom-4"
                        onClick={handleSearchAreaClick}
                    >
                        Search in this area
                    </Button>
                )}

                <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg bg-white/90 hover:bg-white w-12 h-12 self-end"
                    onClick={handleMyLocationClick}
                    title={location ? "Go to my location" : "Find my location"}
                >
                    <Locate className={`w-6 h-6 ${location ? 'text-blue-500' : 'text-gray-500'}`} />
                </Button>
            </div>

            {
                loading && (
                    <div className="absolute top-20 left-4 bg-white/80 p-2 rounded shadow text-xs backdrop-blur-md">
                        Retrieving location...
                    </div>
                )
            }
        </div >
    );
};
