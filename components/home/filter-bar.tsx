
'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const CATEGORIES = ['All', 'Subculture', 'Retro', 'Craft']

interface FilterBarProps {
    selected: string;
    onSelect: (c: string) => void;
    showFavorites?: boolean;
}

export function FilterBar({ selected, onSelect, showFavorites }: FilterBarProps) {
    const categories = showFavorites ? [...CATEGORIES, 'Favorites'] : CATEGORIES;

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-2 px-4">
            {categories.map((cat) => (
                <Badge
                    key={cat}
                    variant={selected === cat ? "default" : "secondary"}
                    className={cn(
                        "cursor-pointer px-4 py-1.5 rounded-full whitespace-nowrap",
                        selected !== cat && "bg-white/80 hover:bg-white border-gray-200 shadow-sm"
                    )}
                    onClick={() => onSelect(cat)}
                >
                    {cat}
                </Badge>
            ))}
        </div>
    )
}
