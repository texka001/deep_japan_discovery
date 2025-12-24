'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { LoginModal } from '@/components/auth/login-modal';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface FavoriteButtonProps {
    spotId: string;
    initialIsFavorite?: boolean;
    className?: string;
    variant?: 'icon' | 'button';
    onToggle?: (isFavorite: boolean) => void;
}

export const FavoriteButton = ({
    spotId,
    initialIsFavorite = false,
    className,
    variant = 'icon',
    onToggle,
}: FavoriteButtonProps) => {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Sync state if prop changes (important for re-renders from parent)
    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    // Check initial status only if user is logged in AND it wasn't passed from parent (undefined)
    // But now we expect parent to handle it often. We'll keep this check for standalone usage flexibility.
    useEffect(() => {
        if (user && initialIsFavorite === undefined) {
            checkFavoriteStatus();
        }
    }, [user, spotId]); // Removed initialIsFavorite from dep array to avoid loops if usage is consistent

    const checkFavoriteStatus = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('favorites')
            .select('favorite_id')
            .eq('user_id', user.id)
            .eq('spot_id', spotId)
            .single();
        setIsFavorite(!!data);
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        e.preventDefault();

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (loading) return;

        // Optimistic update
        const previousState = isFavorite;
        const newState = !isFavorite;
        setIsFavorite(newState);
        onToggle?.(newState); // Notify parent
        setLoading(true);

        try {
            if (previousState) {
                // Remove favorite
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('spot_id', spotId);
                if (error) throw error;
            } else {
                // Add favorite
                const { error } = await supabase.from('favorites').insert({
                    user_id: user.id,
                    spot_id: spotId,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            // Ignore duplicate key error (already favorited)
            if (error?.code === '23505') {
                setIsFavorite(true);
                return;
            }

            console.error('Error toggling favorite:', error);
            // Revert on other errors
            setIsFavorite(previousState);
        } finally {
            setLoading(false);
        }
    };

    if (showLoginModal) {
        return (
            <div onClick={(e) => e.stopPropagation()}>
                <LoginModal />
                {/* This is a bit tricky because LoginModal is a button trigger. 
                 Ideally, we'd trigger the modal programmatically or wrap this better.
                 For now, let's just let the user know they need to login.
              */}
                {/* Better approach: Pass access to open modal logic or reuse LoginModal customized */}
            </div>
        )
    }

    // Actually, re-using LoginModal directly might be complex if it doesn't expose open state control easily from outside without trigger.
    // Simplified: If not logged in, just show normal button that opens login modal?
    // Let's adjust: If not logged in, clicking the heart opens a dialog prompting login.

    if (!user) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('rounded-full hover:bg-black/5', className)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Heart className="w-5 h-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            You need to be logged in to save favorites.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-4">
                        <LoginModal />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                'rounded-full hover:bg-black/5 transition-colors',
                isFavorite ? 'text-red-500 hover:text-red-600' : 'text-zinc-500 hover:text-zinc-700',
                className
            )}
            onClick={toggleFavorite}
            disabled={loading}
        >
            <Heart
                className={cn('w-5 h-5 transition-all', isFavorite && 'fill-current scale-110')}
            />
        </Button>
    );
};
