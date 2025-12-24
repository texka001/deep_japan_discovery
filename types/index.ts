export type Spot = {
    spot_id: string;
    name_en: string;
    name_jp: string;
    category: string;
    difficulty: number;
    avg_stay_minutes: number;
    image_url: string | null;
    deep_guide_json: any; // Ideally this should be typed further if structure is fixed
    description?: string;
    address?: string;
    images?: string[];
    tags?: string[];
    created_at?: string;
};

export type UserProfile = {
    user_id: string;
    subscription_status: 'Free' | 'Pro';
    created_at: string;
};
