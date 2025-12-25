import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Journey } from '@/types';
import { useAuth } from '@/components/auth/auth-provider';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Map, Clock, Calendar, Trash2 } from 'lucide-react';
// import { format } from 'date-fns';

interface RouteListModalProps {
    onLoadRoute: (journey: Journey) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function RouteListModal({ onLoadRoute, open, onOpenChange }: RouteListModalProps) {
    const { user } = useAuth();
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [internalOpen, setInternalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const isControlled = open !== undefined;
    const show = isControlled ? open : internalOpen;
    const setShow = (newState: boolean) => {
        if (isControlled) {
            onOpenChange?.(newState);
        } else {
            setInternalOpen(newState);
        }
    };

    useEffect(() => {
        if (show && user) {
            fetchJourneys();
        }
    }, [show, user]);

    const fetchJourneys = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('journeys')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (data) {
            setJourneys(data);
        }
        setLoading(false);
    };

    const handleSelect = (journey: Journey) => {
        onLoadRoute(journey);
        setShow(false);
    };

    const handleDelete = async (e: React.MouseEvent, journeyId: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this route?')) return;

        const { error } = await supabase.from('journeys').delete().eq('journey_id', journeyId);
        if (error) {
            alert('Failed to delete route');
            console.error(error);
        } else {
            setJourneys(prev => prev.filter(j => j.journey_id !== journeyId));
        }
    };

    if (!user) return null;

    return (
        <Dialog open={show} onOpenChange={setShow}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full shadow-md bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                    <Map className="mr-2 h-4 w-4" />
                    My Routes
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>My Saved Journeys</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {loading ? (
                        <p className="text-center text-muted-foreground">Loading...</p>
                    ) : journeys.length === 0 ? (
                        <p className="text-center text-muted-foreground">No saved routes yet.</p>
                    ) : (
                        <div className="h-[300px] overflow-y-auto pr-2 space-y-3">
                            {journeys.map((journey) => (
                                <div
                                    key={journey.journey_id}
                                    className="border rounded-lg p-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                                    onClick={() => handleSelect(journey)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h3 className="font-bold text-base mb-0.5 truncate">{journey.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-2 truncate">
                                                Start: {journey.route_json.stops?.[0]?.name_en || 'Unknown'}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={(e) => handleDelete(e, journey.journey_id)}
                                            title="Delete Route"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {journey.route_json.total_duration} mins
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(journey.created_at).toLocaleDateString()}
                                        </div>
                                        <div>
                                            {journey.route_json.stops.length} stops
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
