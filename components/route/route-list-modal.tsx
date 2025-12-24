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
import { Map, Clock, Calendar } from 'lucide-react';
// import { format } from 'date-fns';

interface RouteListModalProps {
    onLoadRoute: (journey: Journey) => void;
}

export function RouteListModal({ onLoadRoute }: RouteListModalProps) {
    const { user } = useAuth();
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchJourneys();
        }
    }, [isOpen, user]);

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
        setIsOpen(false);
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                                    <h3 className="font-bold text-base mb-1">{journey.title}</h3>
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
