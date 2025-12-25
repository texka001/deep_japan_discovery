import { useState, useEffect } from 'react';
import { Spot, RouteData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, MapPin, Play, Save, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RouteBuilderProps {
    selectedSpots: Spot[];
    onRemoveSpot: (spotId: string) => void;
    onClear: () => void;
    onOptimize: (startSpotId: string) => void;
    onSave: (title: string) => Promise<void>;
    calculatedRoute: RouteData | null;
    isOptimizing: boolean;
    onSpotSelect?: (spot: Spot) => void;
    onOpenRouteList?: () => void;
    currentJourneyId?: string;
    onDeleteJourney?: () => Promise<void>;
}

export function RouteBuilder({
    selectedSpots,
    onRemoveSpot,
    onClear,
    onOptimize,
    onSave,
    calculatedRoute,
    isOptimizing,
    onSpotSelect,
    onOpenRouteList,
    currentJourneyId,
    onDeleteJourney
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
                    {onOpenRouteList && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={onOpenRouteList} title="My Routes">
                            <MapPin size={18} />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={onClear}>
                        <X size={18} />
                    </Button>
                    {currentJourneyId && onDeleteJourney && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-primary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this journey?')) {
                                    onDeleteJourney();
                                }
                            }}
                            title="Delete This Journey"
                        >
                            <Trash2 size={18} />
                        </Button>
                    )}
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
                                        <div
                                            key={spot.spot_id}
                                            className={`
                                                flex justify-between items-center p-2 rounded-md border
                                                ${spot.is_deleted
                                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 opacity-80'
                                                    : 'bg-card hover:bg-accent cursor-pointer'
                                                }
                                            `}
                                            onClick={() => !spot.is_deleted && onSpotSelect?.(spot)}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <span className={`text-sm font-medium ${spot.is_deleted ? 'text-red-600 line-through' : 'truncate'}`}>
                                                        {spot.name_en}
                                                    </span>
                                                    {spot.is_deleted && (
                                                        <span className="text-xs text-red-500 block">
                                                            This spot has been deleted
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <input
                                                    type="radio"
                                                    name="startSpot"
                                                    checked={startSpotId === spot.spot_id}
                                                    onChange={() => setStartSpotId(spot.spot_id)}
                                                    className="accent-primary w-4 h-4 cursor-pointer"
                                                    title="Set as Start Point"
                                                    disabled={spot.is_deleted}
                                                />
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); onRemoveSpot(spot.spot_id); }} disabled={spot.is_deleted}>
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
                                    {calculatedRoute?.stops.map((stop, i) => {
                                        const leg = i < calculatedRoute.stops.length - 1
                                            ? calculatedRoute.legs?.[i]
                                            : null;
                                        return (
                                            <div key={stop.spot_id} className="relative pl-6 pb-6 last:pb-0">
                                                {/* Timeline Line */}
                                                {i < calculatedRoute.stops.length - 1 && (
                                                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                                                )}

                                                {/* Dot */}
                                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 border-2 border-background
                                                     ${stop.is_deleted ? 'bg-red-100 text-red-600' : 'bg-primary text-primary-foreground'}`}>
                                                    {i + 1}
                                                </div>

                                                <div className={`space-y-1 ${stop.is_deleted ? 'opacity-70' : ''}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className={`font-medium text-sm ${stop.is_deleted ? 'text-red-600 line-through' : ''}`}>
                                                                {stop.name_en}
                                                            </div>
                                                            {stop.is_deleted && (
                                                                <div className="text-xs text-red-500 font-semibold">
                                                                    Deleted Spot
                                                                </div>
                                                            )}
                                                            {!stop.is_deleted && (
                                                                <p className="text-xs text-muted-foreground">{stop.category} • {stop.avg_stay_minutes} min</p>
                                                            )}
                                                        </div>
                                                        {(!stop.is_deleted) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground"
                                                                onClick={() => onSpotSelect?.(stop)}
                                                            >
                                                                <ChevronDown size={14} className="-rotate-90" />
                                                            </Button>
                                                        )}
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
