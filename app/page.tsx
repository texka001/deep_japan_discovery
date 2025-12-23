
'use client';

import { useEffect, useState } from 'react';
import { MapProvider } from '@/components/map/map-provider';
import { MapView } from '@/components/map/map-view';
import { supabase } from '@/lib/supabase';
import { SpotCard } from '@/components/spot/spot-card';
import { SpotDetail } from '@/components/spot/spot-detail';
import { FilterBar } from '@/components/home/filter-bar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function Home() {
  const [spots, setSpots] = useState<any[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  // Fetch spots
  useEffect(() => {
    async function fetchSpots() {
      const { data, error } = await supabase.from('spots').select('*');
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
    } else {
      setFilteredSpots(spots.filter(s => s.category === category));
    }
  }, [category, spots]);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Header / Filter Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none">
        <div className="p-4 bg-gradient-to-b from-white/90 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-bold text-xl tracking-tight">Deep Japan Discovery</h1>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <FilterBar selected={category} onSelect={setCategory} />
        </div>
      </div>

      {/* Map Layer */}
      <div className="w-full h-full absolute inset-0 text-zinc-800">
        <MapProvider>
          <MapView
            spots={filteredSpots}
            onMarkerClick={(spot) => setSelectedSpot(spot)}
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
                <SpotCard spot={spot} onClick={() => setSelectedSpot(spot)} />
              </div>
            ))}
          </div>

          {/* Desktop: Vertical List */}
          <div className="hidden md:flex flex-col gap-4 h-full overflow-y-auto pr-2 pb-20">
            {filteredSpots.map((spot) => (
              <SpotCard key={spot.spot_id} spot={spot} onClick={() => setSelectedSpot(spot)} />
            ))}
          </div>
        </div>
      </div>

      <SpotDetail
        spot={selectedSpot}
        open={!!selectedSpot}
        onOpenChange={(open) => !open && setSelectedSpot(null)}
      />
    </main>
  );
}
