
'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapProvider } from '@/components/map/map-provider';
import { MapView } from '@/components/map/map-view';
import { supabase } from '@/lib/supabase';
import { SpotCard } from '@/components/spot/spot-card';
import { SpotDetail } from '@/components/spot/spot-detail';
import { FilterBar } from '@/components/home/filter-bar';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { LoginModal } from '@/components/auth/login-modal';
import { RouteBuilder } from '@/components/route/route-builder';
import { calculateDistance, getCoordinates } from '@/lib/location';
import { RouteData, Spot, Journey } from '@/types';
import { getRouteLegs } from '@/components/map/directions-service';
import { Waypoints, MapPin } from 'lucide-react';
import { RouteListModal } from '@/components/route/route-list-modal';
import { useGeolocation } from '@/hooks/use-geolocation';

export default function Home() {
  const [spots, setSpots] = useState<any[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  // Geolocation
  const { location, getLocation } = useGeolocation();

  const { user, signOut } = useAuth();
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<Set<string>>(new Set());

  // Route Mode State
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [selectedRouteSpots, setSelectedRouteSpots] = useState<Spot[]>([]);
  const [calculatedRoute, setCalculatedRoute] = useState<RouteData | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeListOpen, setRouteListOpen] = useState(false);
  const [currentJourneyId, setCurrentJourneyId] = useState<string | null>(null);

  // Fetch Favorites
  useEffect(() => {
    if (!user) {
      setFavoriteSpotIds(new Set());
      return;
    }
    const fetchFavorites = async () => {
      const { data } = await supabase.from('favorites').select('spot_id').eq('user_id', user.id);
      if (data) {
        setFavoriteSpotIds(new Set(data.map(f => f.spot_id)));
      }
    };
    fetchFavorites();
  }, [user]);

  // Fetch spots
  useEffect(() => {
    async function fetchSpots() {
      setLoading(true);

      try {
        if (category === 'Nearby') {
          // If location is not yet available, try to get it
          // Note: useGeolocation hook runs on mount, so location might be null initially
          let currentLoc = location;
          if (!currentLoc) {
            // Trigger manual fetch if we can, but useGeolocation exposes getLocation
            // However, getLocation is async but doesn't return a promise resolving to location immediately in the hook design usually.
            // Let's assume the hook handles it or we might need to wait.
            // For now, if no location, we can't fetch nearby properly.
            // Let's trigger it.
            getLocation();

            // If still null, maybe show alert or wait? 
            // Realistically, we should check availability. 
            // For this MVP, let's assume if user clicks Nearby, they want us to try.
            if (!location) {
              // Fallback or wait for valid location (handled by effect dependency on location potentially?)
              // Actually, let's just return if no location, and let the effect re-run when location updates.
              console.log("Waiting for location...");
              setLoading(false);
              return;
            }
          }

          if (location) {
            const { data, error } = await supabase.rpc('get_spots_nearby', {
              lat: location.lat,
              long: location.lng,
              radius_meters: 2000 // 2km
            });

            if (error) {
              console.error("Error fetching nearby spots:", error);
              alert("Error fetching nearby spots");
            } else {
              // RPC returns spots with extra dist_meters
              // We need map to cast location to text if needed, but RPC returns geography.
              // Supabase JS client usually returns format we can use, but MapView expects text or WKB.
              // Let's see what RPC returns. it returns 'location geography'.
              // The SB client might return it as WKB hex string which our getCoordinates handles.

              // But wait, the previous fetch uses .select('*, location:location::text')
              // which forces it to text (WKT/Hex).
              // Our RPC returns geography type directly. 
              // Supabase/PostgREST typically returns GeoJSON or WKB for geography.
              // Let's try to trust the WKB parser in `lib/location.ts` for now.

              setFilteredSpots(data || []);
              // We don't overwrite global 'spots' (cache) with filtered result usually?
              // Actually the current code uses 'spots' as the source of truth for 'All'.
              // If we switch to 'Nearby', we are just setting filteredSpots.
              // But we shouldn't overwrite 'spots' probably, unless we want to cache "All".
              // 'spots' seems to be "All Spots Cache".
            }
          }

        } else {
          // Standard Fetch
          // Check if we already have spots?
          if (spots.length === 0) {
            const { data, error } = await supabase.from('spots').select('*, location:location::text');
            if (data) {
              setSpots(data);
              if (category === 'All') setFilteredSpots(data);
              else if (category === 'Favorites') setFilteredSpots(data.filter(s => favoriteSpotIds.has(s.spot_id)));
              else setFilteredSpots(data.filter(s => s.category === category));
            }
          } else {
            // Client side filtering from cache
            if (category === 'All') {
              setFilteredSpots(spots);
            } else if (category === 'Favorites') {
              setFilteredSpots(spots.filter(s => favoriteSpotIds.has(s.spot_id)));
            } else {
              setFilteredSpots(spots.filter(s => s.category === category));
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSpots();
  }, [category, location, favoriteSpotIds]); // Add location dependency to re-fetch if location updates while on 'Nearby'

  // Filter logic
  // Filter logic handled in main effect now for async RPC reasons
  // ensuring we don't have conflicting effects

  // However, we need to handle "Normal" categories switching.
  // The above effect covers it if we ensure 'spots' are loaded.
  // Let's check the dependency array. 
  // It handles everything now. 
  // We can remove the old filter effect?
  // Old effect:
  /*
  useEffect(() => {
    if (category === 'All') {
      setFilteredSpots(spots);
    } else if (category === 'Favorites') {
      setFilteredSpots(spots.filter(s => favoriteSpotIds.has(s.spot_id)));
    } else {
      setFilteredSpots(spots.filter(s => s.category === category));
    }
  }, [category, spots, favoriteSpotIds]);
  */
  // Wait, if I remove it, I must ensure the main fetchSpots handles it correctly.
  // My rewritten fetchSpots handles:
  // 1. Nearby -> Fetch RPC
  // 2. Others -> If spots empty, fetch All, then filter. If spots not empty, just filter.
  // One edge case: If I click 'All', spots IS NOT empty, so it enters "Else" -> "Client side filtering". Correct.
  // So I can remove this separate effect.

  // Handle toggle from child components
  const handleToggleFavorite = (spotId: string, isFav: boolean) => {
    setFavoriteSpotIds(prev => {
      const next = new Set(prev);
      if (isFav) {
        next.add(spotId);
      } else {
        next.delete(spotId);
      }
      return next;
    });
  };

  // Route Logic
  const handleRouteSpotSelect = (spot: Spot) => {
    setSelectedRouteSpots(prev => {
      const exists = prev.find(s => s.spot_id === spot.spot_id);
      let next;
      if (exists) {
        next = prev.filter(s => s.spot_id !== spot.spot_id);
      } else {
        if (prev.length >= 10) {
          alert("Max 10 spots for now!");
          return prev;
        }
        next = [...prev, spot];
      }

      // If selection changes, invalidate current route calculation
      if (calculatedRoute) {
        setCalculatedRoute(null);
      }
      return next;
    });
  };

  const handleRemoveRouteSpot = (spotId: string) => {
    setSelectedRouteSpots(prev => prev.filter(s => s.spot_id !== spotId));
    if (calculatedRoute) {
      setCalculatedRoute(null); // Reset calculation if modified
    }
  };

  const handleClearRoute = () => {
    setSelectedRouteSpots([]);
    setCalculatedRoute(null);
    setCurrentJourneyId(null);
    setIsRouteMode(false);
  };

  const handleOptimize = async (startSpotId: string) => {
    if (selectedRouteSpots.length < 2) return;
    setIsOptimizing(true);

    try {
      const spots = [...selectedRouteSpots];
      const startSpotIndex = spots.findIndex(s => s.spot_id === startSpotId);
      if (startSpotIndex === -1) throw new Error("Start spot not found");

      // 1. Greedy Nearest Neighbor Sorting (Haversine)
      const route: Spot[] = [];
      const unvisited = new Set(spots.map((_, i) => i));

      let currentIdx = startSpotIndex;
      route.push(spots[currentIdx]);
      unvisited.delete(currentIdx);

      while (unvisited.size > 0) {
        const currentSpot = spots[currentIdx];
        const currentCoords = getCoordinates(currentSpot.location || '');

        if (!currentCoords) {
          const nextIdx = Array.from(unvisited)[0];
          currentIdx = nextIdx;
          route.push(spots[currentIdx]);
          unvisited.delete(currentIdx);
          continue;
        }

        let minDist = Infinity;
        let nearestIdx = -1;

        for (const idx of Array.from(unvisited)) {
          const targetSpot = spots[idx];
          const targetCoords = getCoordinates(targetSpot.location || '');
          if (targetCoords) {
            const d = calculateDistance(currentCoords.lat, currentCoords.lng, targetCoords.lat, targetCoords.lng);
            if (d < minDist) {
              minDist = d;
              nearestIdx = idx;
            }
          }
        }

        if (nearestIdx !== -1) {
          currentIdx = nearestIdx;
          route.push(spots[currentIdx]);
          unvisited.delete(currentIdx);
        } else {
          break;
        }
      }

      // 2. Fetch Actual Directions (Transit / Walking) using Google Maps API
      const legs = await getRouteLegs(route);

      // 3. Calculate Totals
      // Stay Time
      const totalStayMinutes = route.reduce((acc, s) => acc + (s.avg_stay_minutes || 60), 0);

      // Travel Time & Distance from API
      const totalTravelMinutes = legs.reduce((acc, leg) => acc + leg.duration_minutes, 0);
      const totalDistanceMeters = legs.reduce((acc, leg) => acc + leg.distance_meters, 0);

      setCalculatedRoute({
        stops: route,
        legs: legs,
        total_duration: totalStayMinutes + totalTravelMinutes,
        total_distance: totalDistanceMeters,
        start_spot_id: startSpotId
      });

    } catch (e) {
      console.error("Optimization failed", e);
      alert("Could not calculate route. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveJourney = async (title: string) => {
    if (!user) {
      alert("Please login to save routes.");
      return;
    }
    if (!calculatedRoute) return;

    // Check current journey count
    const { count } = await supabase
      .from('journeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count !== null && count >= 10) {
      alert("You can only save up to 10 routes. Please delete some routes to save a new one.");
      return;
    }

    const { data, error } = await supabase.from('journeys').insert({
      user_id: user.id,
      title: title,
      route_json: calculatedRoute
    }).select().single();

    if (error) {
      alert('Failed to save: ' + error.message);
    } else {
      alert('Route saved!');
      if (data) {
        setCurrentJourneyId(data.journey_id);
      }
      // Don't clear route after save, stay in route mode
      // handleClearRoute(); 
    }
  };

  const handleLoadRoute = async (journey: Journey) => {
    // Check if spots still exist in DB and are published
    const spotIds = journey.route_json.stops.map(s => s.spot_id);

    const { data: existingSpots, error } = await supabase
      .from('spots')
      .select('spot_id, status')
      .in('spot_id', spotIds);

    if (error) {
      console.error('Error checking existing spots:', error);
    }

    // Consider a spot valid only if it exists AND status is 'published'
    // If status is missing (old records), assume published? Schema says default 'published'.
    const validSpotIds = new Set(
      existingSpots
        ?.filter(s => s.status === 'published' || !s.status)
        .map(s => s.spot_id) || []
    );

    const processedStops = journey.route_json.stops.map(s => ({
      ...s,
      is_deleted: !validSpotIds.has(s.spot_id)
    }));

    const processedRoute = {
      ...journey.route_json,
      stops: processedStops
    };

    setIsRouteMode(true);
    setCalculatedRoute(processedRoute);
    setSelectedRouteSpots(processedStops);
    setCurrentJourneyId(journey.journey_id);
    // Ensure we switch to result view automatically handled by useEffect in RouteBuilder
    setRouteListOpen(false); // Close the modal
  };

  const handleDeleteCurrentJourney = async () => {
    if (!currentJourneyId || !user) return;

    const { error } = await supabase.from('journeys').delete().eq('journey_id', currentJourneyId);
    if (error) {
      alert("Failed to delete journey");
      console.error(error);
    } else {
      alert("Journey deleted");
      handleClearRoute();

      // Check if there are any remaining journeys
      const { count } = await supabase
        .from('journeys')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count > 0) {
        handleOpenRouteList();
      }
    }
  };

  const handleOpenRouteList = () => {
    setRouteListOpen(true);
  };

  const handleSearchArea = async (bounds: { north: number, south: number, east: number, west: number }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_spots_in_bounds', {
        min_lat: bounds.south,
        min_lng: bounds.west,
        max_lat: bounds.north,
        max_lng: bounds.east
      });

      if (error) {
        console.error("Error searching area:", error);
        alert("Error searching area");
      } else {
        setFilteredSpots(data || []);
        setCategory('Area Search');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Ensure selected route spots are always visible, even if filtered out
  const displayedSpots = useMemo(() => {
    const uniqueSpots = [...filteredSpots];
    selectedRouteSpots.forEach(s => {
      if (!uniqueSpots.find(existing => existing.spot_id === s.spot_id)) {
        uniqueSpots.push(s);
      }
    });
    return uniqueSpots;
  }, [filteredSpots, selectedRouteSpots]);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Header / Filter Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none">
        <div className="p-4 bg-gradient-to-b from-white/90 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-bold text-xl tracking-tight">Deep Japan Discovery</h1>

            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-1 text-sm font-medium bg-white/50 px-2 py-1 rounded-full border">
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => signOut()} title="Logout" className="bg-white/50 hover:bg-white rounded-full">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <LoginModal />
              )}

              <Button variant="outline" size="icon" className="md:hidden rounded-full">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <FilterBar selected={category} onSelect={setCategory} showFavorites={!!user} />
        </div>
      </div>

      {/* Route Toggle Button */}
      <div className="absolute top-28 left-4 z-30 flex flex-col gap-2 items-start">
        <Button
          className={`rounded-full shadow-lg transition-all border-2 border-slate-900 ${isRouteMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent' : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white'}`}
          onClick={() => {
            if (isRouteMode) {
              handleClearRoute();
            } else {
              setIsRouteMode(true);
              setSelectedSpot(null);
            }
          }}
        >
          <Waypoints className={`h-4 w-4 ${isRouteMode ? 'mr-0 md:mr-2' : 'mr-0 md:mr-2'}`} />
          <span className="hidden md:inline">{isRouteMode ? 'Exit Route Mode' : 'Create Route'}</span>
        </Button>

        <RouteListModal onLoadRoute={handleLoadRoute} open={routeListOpen} onOpenChange={setRouteListOpen} />
      </div>

      {isRouteMode && (
        <RouteBuilder
          selectedSpots={selectedRouteSpots}
          onRemoveSpot={handleRemoveRouteSpot}
          onClear={handleClearRoute}
          onOptimize={handleOptimize}
          onSave={handleSaveJourney}
          calculatedRoute={calculatedRoute}
          isOptimizing={isOptimizing}
          onSpotSelect={setSelectedSpot}
          onOpenRouteList={handleOpenRouteList}
          currentJourneyId={currentJourneyId || undefined}
          onDeleteJourney={handleDeleteCurrentJourney}
        />
      )}

      {/* Map Layer */}
      <div className="w-full h-full absolute inset-0 text-zinc-800">
        <MapProvider>
          <MapView
            spots={displayedSpots}
            onMarkerClick={(spot) => setSelectedSpot(spot)}
            selectedSpotId={selectedSpot?.spot_id}
            isRouteMode={isRouteMode}
            onRouteSpotSelect={(spot) => setSelectedSpot(spot)} // Always open detail on click
            selectedRouteSpots={selectedRouteSpots}
            routePath={calculatedRoute?.stops}
            routeLegs={calculatedRoute?.legs}
            favoriteSpotIds={favoriteSpotIds}
            onSearchArea={handleSearchArea}
          />
        </MapProvider>
      </div>

      {/* Access Token Warning (if needed) */}

      {/* Bottom Sheet / List for Mobile & Sidebar for Desktop */}
      <div className="absolute bottom-4 left-4 right-4 z-20 md:left-4 md:top-24 md:bottom-4 md:w-96 md:right-auto pointer-events-none">
        <div className="h-full pointer-events-auto flex flex-col gap-4 overflow-hidden">
          {/* We can put a Horizontal scroll list here for mobile, or a vertical list for desktop */}
          {/* Mobile: Horizontal Carousel */}
          <div className="md:hidden flex overflow-x-auto gap-4 pb-4 snap-x">
            {/* Hide normal spot cards in Route Mode to reduce clutter? Or Keep them? Keeping them is fine. */}
            {filteredSpots.map((spot) => (
              <div key={spot.spot_id} className="min-w-[280px] snap-center">
                <SpotCard
                  spot={spot}
                  onClick={() => setSelectedSpot(spot)}
                  isFavorite={favoriteSpotIds.has(spot.spot_id)}
                  onToggleFavorite={(isFav) => handleToggleFavorite(spot.spot_id, isFav)}
                />
              </div>
            ))}
          </div>

          {/* Desktop: Vertical List */}
          <div className="hidden md:flex flex-col gap-4 h-full overflow-y-auto pr-2 pb-20">
            {filteredSpots.map((spot) => (
              <SpotCard
                key={spot.spot_id}
                spot={spot}
                onClick={() => setSelectedSpot(spot)}
                isFavorite={favoriteSpotIds.has(spot.spot_id)}
                onToggleFavorite={(isFav) => handleToggleFavorite(spot.spot_id, isFav)}
              />
            ))}
          </div>
        </div>
      </div>

      <SpotDetail
        spot={selectedSpot}
        open={!!selectedSpot}
        onOpenChange={(open) => !open && setSelectedSpot(null)}
        isFavorite={selectedSpot ? favoriteSpotIds.has(selectedSpot.spot_id) : false}
        onToggleFavorite={(isFav) => selectedSpot && handleToggleFavorite(selectedSpot.spot_id, isFav)}
        isRouteMode={isRouteMode}
        isInRoute={selectedSpot ? selectedRouteSpots.some(s => s.spot_id === selectedSpot.spot_id) : false}
        onToggleRoute={() => {
          if (selectedSpot) {
            handleRouteSpotSelect(selectedSpot);
            setSelectedSpot(null); // Close modal after action
          }
        }}
      />
    </main>
  );
}
