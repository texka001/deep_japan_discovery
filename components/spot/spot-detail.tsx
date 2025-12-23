
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
import { Clock, MapPin, AlertTriangle, MessageCircle, Info } from "lucide-react"

type Spot = {
    spot_id: string
    name_en: string
    name_jp: string
    category: string
    difficulty: number
    avg_stay_minutes: number
    image_url: string | null
    deep_guide_json: any
}

interface SpotDetailProps {
    spot: Spot | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SpotDetail({ spot, open, onOpenChange }: SpotDetailProps) {
    if (!spot) return null

    const guide = spot.deep_guide_json || {}

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
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        ✕
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold">{spot.name_en}</h2>
                            <Badge variant="outline" className="mt-1">Lvl.{spot.difficulty}</Badge>
                        </div>
                        <p className="text-muted-foreground">{spot.name_jp}</p>
                        <div className="flex gap-2 mt-2">
                            <Badge>{spot.category}</Badge>
                            <div className="flex items-center text-sm text-gray-500 gap-1 ml-2">
                                <Clock className="w-4 h-4" />
                                <span>{spot.avg_stay_minutes} min</span>
                            </div>
                        </div>
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
                </div>

            </SheetContent>
        </Sheet>
    )
}
