
'use client';

import { useEffect, useState } from 'react';
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

export default function Home() {
  const [spots, setSpots] = useState<any[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  const { user, signOut } = useAuth();
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<Set<string>>(new Set());

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

      {/* Map Layer */}
      <div className="w-full h-full absolute inset-0 text-zinc-800">
        <MapProvider>
          <MapView
            spots={filteredSpots}
            onMarkerClick={(spot) => setSelectedSpot(spot)}
            selectedSpotId={selectedSpot?.spot_id}
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
      />
    </main>
  );
}
