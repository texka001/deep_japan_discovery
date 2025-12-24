
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin } from "lucide-react"
import Image from "next/image"
import { FavoriteButton } from "./favorite-button"

import { Spot } from "@/types"

interface SpotCardProps {
    spot: Spot;
    isFavorite?: boolean;
    onToggleFavorite?: (isFav: boolean) => void;
    onClick?: () => void;
}

export function SpotCard({ spot, isFavorite, onToggleFavorite, onClick }: SpotCardProps) {
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
                <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{spot.category}</Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-4">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{spot.avg_stay_minutes} min</span>
                    </div>
                    {/* Distance could be calculated if we had current location here */}
                </div>
            </CardContent>
        </Card>
    )
}
