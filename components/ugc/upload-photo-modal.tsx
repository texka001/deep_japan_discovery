'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { Loader2, Camera } from 'lucide-react';
import { Spot } from '@/types';

interface UploadPhotoModalProps {
    spot: Spot;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UploadPhotoModal({ spot, open, onOpenChange }: UploadPhotoModalProps) {
    const { user } = useAuth();
    const [photoUrl, setPhotoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!user || !photoUrl.trim()) return;
        setLoading(true);

        try {
            // In a real app, we would upload the file to Supabase Storage here.
            // For this phase, we accept an image URL.
            const { error } = await supabase.from('spot_photos').insert({
                spot_id: spot.spot_id,
                user_id: user.id,
                image_url: photoUrl,
                status: 'pending' // Requires approval
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setPhotoUrl('');
                onOpenChange(false);
            }, 2000);

        } catch (e) {
            console.error(e);
            alert('Failed to submit photo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Photo</DialogTitle>
                    <DialogDescription>
                        Share your experience at {spot.name_en}.
                    </DialogDescription>
                </DialogHeader>

                {!success ? (
                    <div className="space-y-4">
                        <div>
                            {/* Placeholder for future File Uploader */}
                            <Label>Image URL</Label>
                            <Input
                                placeholder="https://..."
                                value={photoUrl}
                                onChange={e => setPhotoUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                * Entering a direct image URL for this demo.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={loading || !photoUrl.trim()}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Submit Photo
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="py-8 text-center text-green-600 font-medium">
                        <Camera className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        Uploaded! Your photo is pending approval.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
