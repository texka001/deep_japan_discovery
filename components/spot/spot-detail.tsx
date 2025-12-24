
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Clock, MapPin, AlertTriangle, MessageCircle, Info, Camera, Edit } from "lucide-react"
import { FavoriteButton } from "./favorite-button"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { UploadPhotoModal } from "@/components/ugc/upload-photo-modal"
import { SuggestEditModal } from "@/components/ugc/suggest-edit-modal"

import { Spot } from "@/types"

interface SpotDetailProps {
    spot: Spot | null
    open: boolean
    onOpenChange: (open: boolean) => void
    isFavorite?: boolean
    onToggleFavorite?: (isFav: boolean) => void
}

export function SpotDetail({ spot, open, onOpenChange, isFavorite, onToggleFavorite }: SpotDetailProps) {
    if (!spot) return null

    const guide = spot.deep_guide_json || {}
    const { user } = useAuth();
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[85vh] sm:h-full sm:max-w-md p-0 overflow-y-auto rounded-t-xl sm:rounded-none">

                {/* Cover Image */}
                <div className="relative w-full h-64">
                    {spot.image_url ? (
                        <Image
                            src={spot.image_url}
                            alt={spot.name_en}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full z-20"
                        onClick={() => onOpenChange(false)}
                    >
                        ✕
                    </Button>
                    <div className="absolute top-4 left-4 z-20">
                        <FavoriteButton
                            spotId={spot.spot_id}
                            initialIsFavorite={isFavorite}
                            onToggle={onToggleFavorite}
                            className="bg-white/50 hover:bg-white/90 text-black dark:bg-black/50 dark:text-white backdrop-blur-sm"
                        />
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex justify-between items-start">
                            <SheetTitle className="text-2xl font-bold text-left">{spot.name_en}</SheetTitle>
                            <Badge variant="outline" className="mt-1">Lvl.{spot.difficulty}</Badge>
                        </div>
                        <p className="text-muted-foreground">{spot.name_jp}</p>

                        {spot.address && (
                            <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span>{spot.address}</span>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge>{spot.category}</Badge>
                            {spot.tags && spot.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                            ))}
                            <div className="flex items-center text-sm text-gray-500 gap-1 ml-2">
                                <Clock className="w-4 h-4" />
                                <span>{spot.avg_stay_minutes} min</span>
                            </div>
                        </div>

                        {/* Description */}
                        {spot.description && (
                            <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                {spot.description}
                            </p>
                        )}

                        {/* Gallery */}
                        {spot.images && spot.images.length > 0 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x">
                                {spot.images.map((img, idx) => (
                                    <div key={idx} className="relative w-40 h-28 flex-shrink-0 rounded-md overflow-hidden snap-center border">
                                        <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Deep Guide Section */}
                    {(guide.how_to_enter || guide.must_follow_rules) && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Deep Guide
                            </h3>

                            {guide.how_to_enter && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">How to Enter</h4>
                                    <p className="text-sm">{guide.how_to_enter}</p>
                                </div>
                            )}

                            {guide.must_follow_rules && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-red-700 dark:text-red-300 mb-1 flex items-center gap-1">
                                        <AlertTriangle className="w-4 h-4" />
                                        Must-Follow Rules
                                    </h4>
                                    <p className="text-sm">{guide.must_follow_rules}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Communication Cards */}
                    {guide.communication_cards && guide.communication_cards.length > 0 && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Communication Cards
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {guide.communication_cards.map((card: any, idx: number) => (
                                    <div key={idx} className="border p-3 rounded-lg flex justify-between items-center shadow-sm">
                                        <span className="font-medium">{card.label}</span>
                                        <span className="text-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{card.jp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pb-8"></div>

                    {/* UGC Actions */}
                    <div className="flex gap-2 pb-8">
                        <Button variant="outline" className="flex-1" onClick={() => user ? setShowPhotoModal(true) : alert("Please login to contribute")}>
                            <Camera className="w-4 h-4 mr-2" />
                            Add Photo
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => user ? setShowEditModal(true) : alert("Please login to suggest edits")}>
                            <Edit className="w-4 h-4 mr-2" />
                            Suggest Edit
                        </Button>
                    </div>
                </div>

            </SheetContent>

            <UploadPhotoModal
                spot={spot}
                open={showPhotoModal}
                onOpenChange={setShowPhotoModal}
            />
            <SuggestEditModal
                spot={spot}
                open={showEditModal}
                onOpenChange={setShowEditModal}
            />
        </Sheet>
    )
}
