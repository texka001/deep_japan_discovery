'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { Loader2 } from 'lucide-react';
import { Spot } from '@/types';

interface SuggestEditModalProps {
    spot: Spot;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SuggestEditModal({ spot, open, onOpenChange }: SuggestEditModalProps) {
    const { user } = useAuth();
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!user || !suggestion.trim()) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('spot_corrections').insert({
                spot_id: spot.spot_id,
                user_id: user.id,
                suggested_data: { comment: suggestion },
                status: 'pending'
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setSuggestion('');
                onOpenChange(false);
            }, 2000);

        } catch (e) {
            console.error(e);
            alert('Failed to submit suggestion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Suggest an Edit</DialogTitle>
                    <DialogDescription>
                        Help us improve the information for {spot.name_en}.
                    </DialogDescription>
                </DialogHeader>

                {!success ? (
                    <div className="space-y-4">
                        <div>
                            <Label>What should be changed?</Label>
                            <Textarea
                                placeholder="e.g. The opening hours are wrong..."
                                value={suggestion}
                                onChange={e => setSuggestion(e.target.value)}
                                className="h-32"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={loading || !suggestion.trim()}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Submit Suggestion
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="py-8 text-center text-green-600 font-medium">
                        Thank you! Your suggestion has been submitted for review.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
