import { useState, useEffect } from 'react';
import { Spot, RouteData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, MapPin, Play, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RouteBuilderProps {
    selectedSpots: Spot[];
    onRemoveSpot: (spotId: string) => void;
    onClear: () => void;
    onOptimize: (startSpotId: string) => void;
    onSave: (title: string) => Promise<void>;
    calculatedRoute: RouteData | null;
    isOptimizing: boolean;
}

export function RouteBuilder({
    selectedSpots,
    onRemoveSpot,
    onClear,
    onOptimize,
    onSave,
    calculatedRoute,
    isOptimizing,
}: RouteBuilderProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [startSpotId, setStartSpotId] = useState<string>('');
    const [routeTitle, setRouteTitle] = useState('');
    const [viewMode, setViewMode] = useState<'selection' | 'result'>('selection');

    useEffect(() => {
        if (selectedSpots.length > 0 && !startSpotId) {
            setStartSpotId(selectedSpots[0].spot_id);
        }
    }, [selectedSpots, startSpotId]);

    useEffect(() => {
        if (calculatedRoute) {
            setViewMode('result');
        } else {
            setViewMode('selection');
        }
    }, [calculatedRoute]);

    if (selectedSpots.length === 0) return null;

    return (
        <Card className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50 shadow-2xl transition-all duration-300">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MapPin size={18} />
                    My Route Builder ({selectedSpots.length})
                </CardTitle>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={onClear}>
                        <X size={18} />
                    </Button>
                </div>
            </CardHeader>

            {isOpen && (
                <CardContent className="p-4 bg-background">
                    {viewMode === 'selection' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Select spots from the map to add to your route.</p>

                            <div className="h-48 border rounded-md p-2 overflow-y-auto">
                                <div className="space-y-2">
                                    {selectedSpots.map((spot, idx) => (
                                        <div key={spot.spot_id} className="flex items-center justify-between bg-secondary/20 p-2 rounded text-sm">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="font-bold text-xs bg-muted px-1 rounded">{idx + 1}</span>
                                                <span className="truncate">{spot.name_en}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <input
                                                    type="radio"
                                                    name="startSpot"
                                                    checked={startSpotId === spot.spot_id}
                                                    onChange={() => setStartSpotId(spot.spot_id)}
                                                    className="accent-primary w-4 h-4 cursor-pointer"
                                                    title="Set as Start Point"
                                                />
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemoveSpot(spot.spot_id)}>
                                                    <X size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-xs text-right text-muted-foreground">*Check the radio button to set Start Point</div>

                            <Button
                                className="w-full"
                                disabled={selectedSpots.length < 2 || !startSpotId || isOptimizing}
                                onClick={() => onOptimize(startSpotId)}
                            >
                                <Play size={16} className="mr-2" />
                                {isOptimizing ? 'Calculating...' : 'Calculate Route'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold">Optimized Route</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setViewMode('selection')}>Edit</Button>
                                </div>
                                <div className="bg-muted p-2 rounded-md text-sm">
                                    <div>Total Duration: <strong>{calculatedRoute?.total_duration} mins</strong></div>
                                    <div className="text-xs text-muted-foreground">{(calculatedRoute?.total_distance || 0) / 1000} km walk</div>
                                </div>
                            </div>

                            <div className="h-64 border rounded-md p-2 overflow-y-auto">
                                <div className="space-y-0 relative">
                                    {calculatedRoute?.stops.map((spot, idx) => {
                                        const leg = idx < calculatedRoute.stops.length - 1
                                            ? calculatedRoute.legs?.[idx]
                                            : null;

                                        return (
                                            <div key={spot.spot_id} className="relative">
                                                {/* Spot Node */}
                                                <div className="flex gap-3 relative z-10 bg-background/80 py-2">
                                                    <div className="relative z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="text-sm pt-0.5">
                                                        <div className="font-medium">{spot.name_en}</div>
                                                        <div className="text-xs text-muted-foreground">{idx === 0 ? 'Start Point' : `${spot.avg_stay_minutes} min stay`}</div>
                                                    </div>
                                                </div>

                                                {/* Connecting Leg */}
                                                {leg && (
                                                    <div className="ml-3 pl-6 border-l-2 border-dashed border-muted-foreground/50 pb-4 text-xs text-muted-foreground flex flex-col gap-1 my-1">
                                                        {leg.mode === 'TRANSIT' ? (
                                                            <div className="flex items-center gap-1 text-blue-600 font-medium">
                                                                <span>🚆 Transit</span>
                                                                <span>• {leg.duration_minutes} min</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-green-600 font-medium">
                                                                <span>🚶 Walk</span>
                                                                <span>• {leg.duration_minutes} min</span>
                                                                <span className="text-muted-foreground font-normal">({Math.round(leg.distance_meters)}m)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t">
                                <Input
                                    placeholder="Route Name (e.g. My Akiba Tour)"
                                    value={routeTitle}
                                    onChange={(e) => setRouteTitle(e.target.value)}
                                />
                                <Button className="w-full" onClick={() => onSave(routeTitle)} disabled={!routeTitle.trim()}>
                                    <Save size={16} className="mr-2" />
                                    Save Journey
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
