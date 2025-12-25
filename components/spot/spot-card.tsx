import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Copy, Check } from "lucide-react"
import Image from "next/image"
import { FavoriteButton } from "./favorite-button"
import { getGoogleMapsUrl } from "@/lib/location"

import { Spot } from "@/types"

interface SpotCardProps {
    spot: Spot;
    isFavorite?: boolean;
    onToggleFavorite?: (isFav: boolean) => void;
    onClick?: () => void;
}

export function SpotCard({ spot, isFavorite, onToggleFavorite, onClick }: SpotCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (spot.card_id) {
            navigator.clipboard.writeText(spot.card_id.toString());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow relative" onClick={onClick}>
            <CardHeader className="p-0 overflow-hidden rounded-t-lg">
                <div className="relative w-full h-40">
                    {spot.image_url ? (
                        <Image
                            src={spot.image_url}
                            alt={spot.name_en}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            No Image
                        </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-black/70 hover:bg-black/80">
                        Lvl.{spot.difficulty}
                    </Badge>
                    {spot.status === 'on_hold' && (
                        <Badge variant="destructive" className="absolute top-2 left-16 bg-yellow-600/90 hover:bg-yellow-700/90 text-white border-none">
                            掲載保留
                        </Badge>
                    )}
                    {spot.status === 'closed' && (
                        <Badge variant="secondary" className="absolute top-2 left-16 bg-gray-600/90 hover:bg-gray-700/90 text-white border-none">
                            閉店
                        </Badge>
                    )}
                    <FavoriteButton
                        spotId={spot.spot_id}
                        initialIsFavorite={isFavorite}
                        onToggle={onToggleFavorite}
                        className="absolute top-2 right-2 bg-white/50 hover:bg-white/90 dark:bg-black/50 dark:hover:bg-black/80 backdrop-blur-sm z-10"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <CardTitle className="text-lg font-bold line-clamp-1">{spot.name_en}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground line-clamp-1">{spot.name_jp}</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2 mb-2 items-center">
                    <Badge variant="outline" className="text-xs">{spot.category}</Badge>
                    {spot.card_id && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            <span>#{spot.card_id}</span>
                            <button
                                onClick={handleCopyId}
                                className="hover:text-black dark:hover:text-white transition-colors p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                title="Copy ID"
                            >
                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-4">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{spot.avg_stay_minutes} min</span>
                    </div>
                    {/* Distance could be calculated if we had current location here */}

                    <a
                        href={getGoogleMapsUrl(spot)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline ml-auto"
                        title="Open in Google Maps"
                    >
                        <MapPin className="w-3 h-3" />
                        Google Maps
                    </a>
                </div>
            </CardContent>
        </Card>
    )
}
