
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    const sampleSpots = [
        {
            name_en: 'Super Potato Akihabara',
            name_jp: 'スーパーポテト 秋葉原店',
            location: 'POINT(139.771250 35.699250)', // Approx location
            category: 'Subculture',
            difficulty: 1,
            avg_stay_minutes: 45,
            deep_guide_json: {
                how_to_enter: 'Just walk in. 3rd to 5th floors.',
                must_follow_rules: 'No eating or drinking.',
                communication_cards: [
                    { label: 'Retro Games', jp: 'レトロゲーム' },
                    { label: 'Is this working?', jp: 'これは動きますか？' }
                ]
            },
            image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000'
        },
        {
            name_en: 'Maidreamin Akihabara',
            name_jp: 'めいどりーみん 秋葉原',
            location: 'POINT(139.772500 35.698500)',
            category: 'Subculture',
            difficulty: 2,
            avg_stay_minutes: 90,
            deep_guide_json: {
                how_to_enter: 'Wait at entrance to be seated.',
                must_follow_rules: 'Charge fee applies (approx 500-800 yen). One drink order mandatory.',
                communication_cards: []
            },
            image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000'
        },
        {
            name_en: 'Kanda Myojin Shrine',
            name_jp: '神田明神',
            location: 'POINT(139.767800 35.701900)',
            category: 'Craft', // Fits 'Tradition'
            difficulty: 1,
            avg_stay_minutes: 60,
            deep_guide_json: {
                how_to_enter: 'Bow before entering the Torii gate.',
                must_follow_rules: 'Quiet contemplation. Wash hands at temizuya.',
                communication_cards: []
            },
            image_url: 'https://images.unsplash.com/photo-1588825852503-24754ac608d0?auto=format&fit=crop&q=80&w=1000'
        },
        {
            name_en: 'Akihabara Gachapon Hall',
            name_jp: '秋葉原ガチャポン会館',
            location: 'POINT(139.770800 35.700500)',
            category: 'Subculture',
            difficulty: 1,
            avg_stay_minutes: 30,
            deep_guide_json: {},
            image_url: 'https://images.unsplash.com/photo-1627848606012-706593d6718d?auto=format&fit=crop&q=80&w=1000'
        },
        {
            name_en: 'Radio Center',
            name_jp: '秋葉原ラジオセンター',
            location: 'POINT(139.772800 35.698200)',
            category: 'Retro',
            difficulty: 3,
            avg_stay_minutes: 40,
            deep_guide_json: {
                how_to_enter: 'Narrow corridors. Backpacks in front.',
                must_follow_rules: 'Cash only mostly. Do not touch delicate parts.',
                communication_cards: []
            },
            image_url: 'https://images.unsplash.com/photo-1563861826-6819446d3e8c?auto=format&fit=crop&q=80&w=1000'
        }
    ];

    try {
        const { data, error } = await supabase.from('spots').insert(sampleSpots);
        if (error) {
            console.error('Seed error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Seed successful', data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
