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
    location?: string; // WKT or similar if needed
    card_id?: number;
    status?: 'published' | 'on_hold' | 'closed';
    is_deleted?: boolean;
};

export type UserProfile = {
    user_id: string;
    subscription_status: 'Free' | 'Pro';
    created_at: string;
};

export interface RouteLeg {
    from_spot_id: string;
    to_spot_id: string;
    mode: 'WALKING' | 'TRANSIT';
    duration_minutes: number;
    distance_meters: number;
    polyline?: string; // Encoded polyline
}

export interface RouteData {
    stops: Spot[];
    legs: RouteLeg[];
    total_duration: number; // minutes
    total_distance: number; // meters (approx)
    start_spot_id: string;
}

export interface Journey {
    journey_id: string;
    user_id: string;
    title: string;
    route_json: RouteData;
    created_at: string;
}

export interface SpotCorrection {
    correction_id: string;
    spot_id: string;
    user_id: string;
    suggested_data: any;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    spots?: Spot;
}

export interface SpotPhoto {
    photo_id: string;
    spot_id: string;
    user_id: string;
    image_url: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    spots?: Spot;
}
