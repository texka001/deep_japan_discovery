
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
import { Waypoints } from 'lucide-react';
import { RouteListModal } from '@/components/route/route-list-modal';

export default function Home() {
  const [spots, setSpots] = useState<any[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  const { user, signOut } = useAuth();
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<Set<string>>(new Set());

  // Route Mode State
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [selectedRouteSpots, setSelectedRouteSpots] = useState<Spot[]>([]);
  const [calculatedRoute, setCalculatedRoute] = useState<RouteData | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

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
      // Cast location to text to get "POINT(lng lat)" format for MapView
      const { data, error } = await supabase.from('spots').select('*, location:location::text');
      if (data) {
        setSpots(data);
        setFilteredSpots(data);
      }
      setLoading(false);
    }
    fetchSpots();
  }, []);

  // Filter logic
  useEffect(() => {
    if (category === 'All') {
      setFilteredSpots(spots);
    } else if (category === 'Favorites') {
      setFilteredSpots(spots.filter(s => favoriteSpotIds.has(s.spot_id)));
    } else {
      setFilteredSpots(spots.filter(s => s.category === category));
    }
  }, [category, spots, favoriteSpotIds]);

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

    const { error } = await supabase.from('journeys').insert({
      user_id: user.id,
      title: title,
      route_json: calculatedRoute
    });

    if (error) {
      alert('Failed to save: ' + error.message);
    } else {
      alert('Route saved!');
      handleClearRoute();
    }
  };

  const handleLoadRoute = (journey: Journey) => {
    setIsRouteMode(true);
    setCalculatedRoute(journey.route_json);
    setSelectedRouteSpots(journey.route_json.stops);
    // Ensure we switch to result view automatically handled by useEffect in RouteBuilder
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
          className={`rounded-full shadow-lg transition-all ${isRouteMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
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

        {!isRouteMode && <RouteListModal onLoadRoute={handleLoadRoute} />}
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
