'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const { user } = useAuth();
    const [inputName, setInputName] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState('');

    // New States for UGC
    const [activeTab, setActiveTab] = useState<'generator' | 'ugc'>('generator');
    const [pendingPhotos, setPendingPhotos] = useState<any[]>([]);
    const [pendingCorrections, setPendingCorrections] = useState<any[]>([]);

    const handleGenerate = async () => {
        setLoading(true);
        setSuccessMsg('');
        try {
            const res = await fetch('/api/admin/generate-spot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: inputName, url: inputUrl }),
            });
            const json = await res.json();
            if (json.success) {
                setGeneratedData(json.data);
            } else {
                alert('Failed to generate');
            }
        } catch (e) {
            console.error(e);
            alert('Error calling API');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedData || !user) return;
        setLoading(true);

        try {
            // Prepare data for Supabase
            // Location needs to be inserted carefully. 
            // Supabase-js often handles GeoJSON if postgis is set up, 
            // but simpler is to rely on a text representation or use a raw query if needed.
            // Let's try the standard GeoJSON format supported by PostgREST 
            const location = generatedData.location || `POINT(${generatedData.lng} ${generatedData.lat})`;

            const { error } = await supabase.from('spots').insert({
                name_en: generatedData.name_en,
                name_jp: generatedData.name_jp,
                category: generatedData.category,
                difficulty: generatedData.difficulty,
                avg_stay_minutes: generatedData.avg_stay_minutes,
                description: generatedData.description,
                address: generatedData.address,
                tags: generatedData.tags,
                images: generatedData.images,
                deep_guide_json: generatedData.deep_guide_json,
                location: location, // PostgREST can often parse WKT for geography
                image_url: generatedData.images?.[0] || null
            });

            if (error) {
                throw error;
            }

            setSuccessMsg('Spot saved successfully!');
            setGeneratedData(null);
            setInputName('');
            setInputUrl('');

        } catch (e: any) {
            console.error(e);
            alert(`Error saving: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Fetch UGC data when tab changes to 'ugc'
    const fetchUGC = async () => {
        setLoading(true);
        const { data: photos } = await supabase
            .from('spot_photos')
            .select(`
                *,
                spots (name_en)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        const { data: corrections } = await supabase
            .from('spot_corrections')
            .select(`
                *,
                spots (name_en)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (photos) setPendingPhotos(photos);
        if (corrections) setPendingCorrections(corrections);
        setLoading(false);
    };

    const handleApprovePhoto = async (id: string, spotId: string, url: string) => {
        // 1. Update status
        await supabase.from('spot_photos').update({ status: 'approved' }).eq('photo_id', id);

        // 2. Add to spots images array
        // Fetch current images first
        const { data: spot } = await supabase.from('spots').select('images').eq('spot_id', spotId).single();
        const currentImages = spot?.images || [];
        await supabase.from('spots').update({ images: [...currentImages, url] }).eq('spot_id', spotId);

        fetchUGC(); // Refresh
    };

    const handleRejectPhoto = async (id: string) => {
        await supabase.from('spot_photos').update({ status: 'rejected' }).eq('photo_id', id);
        fetchUGC();
    };

    const handleApproveCorrection = async (correction: any) => {
        // 1. Update spot with new data
        // Only update fields that are present in the correction (though simplified here to update field by field logic if needed, 
        // usually we'd parse the corrected_data json)
        // For now, let's assume corrected_data matches the partial spot schema

        // correction.corrected_data is JSONB.
        await supabase.from('spots').update(correction.corrected_data || correction.suggested_data).eq('spot_id', correction.spot_id);

        // 2. Update status
        await supabase.from('spot_corrections').update({ status: 'approved' }).eq('correction_id', correction.correction_id);
        fetchUGC();
    };

    const handleRejectCorrection = async (id: string) => {
        await supabase.from('spot_corrections').update({ status: 'rejected' }).eq('correction_id', id);
        fetchUGC();
    };

    if (!user) {
        return <div className="p-8 text-center">Please log in to access Admin Dashboard.</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <Link href="/" className="text-blue-500 hover:underline">Back to Home</Link>
            </div>

            <div className="flex gap-4 mb-6 border-b pb-2">
                <Button
                    variant={activeTab === 'generator' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('generator')}
                >
                    Spot Generator
                </Button>
                <Button
                    variant={activeTab === 'ugc' ? 'default' : 'ghost'}
                    onClick={() => { setActiveTab('ugc'); fetchUGC(); }}
                >
                    UGC Review
                </Button>
            </div>

            {activeTab === 'generator' ? (
                <>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Spot Generator (AI)</CardTitle>
                        </CardHeader>
                        {/* ... Existing Generator Content ... */}
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Spot Name</Label>
                                <Input
                                    value={inputName}
                                    onChange={e => setInputName(e.target.value)}
                                    placeholder="e.g. Super Potato Akihabara"
                                />
                            </div>
                            <div>
                                <Label>Reference URL (Optional)</Label>
                                <Input
                                    value={inputUrl}
                                    onChange={e => setInputUrl(e.target.value)}
                                    placeholder="e.g. Google Maps URL"
                                />
                            </div>
                            <Button onClick={handleGenerate} disabled={loading || !inputName} className="w-full">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Generate Data
                            </Button>
                        </CardContent>
                    </Card>

                    {generatedData && (
                        <Card className="border-green-500 border-2">
                            <CardHeader className="bg-green-50 dark:bg-green-900/20">
                                <CardTitle className="text-green-700 dark:text-green-300">Preview Generated Data</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Name (EN)</Label>
                                        <Input value={generatedData.name_en} onChange={e => setGeneratedData({ ...generatedData, name_en: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Name (JP)</Label>
                                        <Input value={generatedData.name_jp} onChange={e => setGeneratedData({ ...generatedData, name_jp: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <Label>Address</Label>
                                    <Input value={generatedData.address || ''} onChange={e => setGeneratedData({ ...generatedData, address: e.target.value })} />
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <textarea
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                        value={generatedData.description}
                                        onChange={e => setGeneratedData({ ...generatedData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Category</Label>
                                        <select
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={generatedData.category}
                                            onChange={e => setGeneratedData({ ...generatedData, category: e.target.value })}
                                        >
                                            <option value="Subculture">Subculture</option>
                                            <option value="Retro">Retro</option>
                                            <option value="Craft">Craft</option>
                                            <option value="Food">Food</option>
                                            <option value="Nature">Nature</option>
                                            <option value="Temple">Temple</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Avg Stay (min)</Label>
                                        <Input type="number" value={generatedData.avg_stay_minutes} onChange={e => setGeneratedData({ ...generatedData, avg_stay_minutes: parseInt(e.target.value) })} />
                                    </div>
                                </div>

                                <div>
                                    <Label>Tags (comma separated)</Label>
                                    <Input
                                        value={generatedData.tags?.join(', ')}
                                        onChange={e => setGeneratedData({ ...generatedData, tags: e.target.value.split(',').map((t: string) => t.trim()) })}
                                    />
                                </div>

                                <div>
                                    <Label>Images (comma separated URLs)</Label>
                                    <Input
                                        value={generatedData.images?.join(', ')}
                                        onChange={e => setGeneratedData({ ...generatedData, images: e.target.value.split(',').map((t: string) => t.trim()) })}
                                    />
                                </div>

                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono overflow-auto max-h-40">
                                    <pre>{JSON.stringify(generatedData, null, 2)}</pre>
                                </div>

                                <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    {loading ? 'Saving...' : 'Save to Database'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : (
                <div className="space-y-6">
                    <section>
                        <h2 className="text-xl font-bold mb-2">Pending Photos ({pendingPhotos.length})</h2>
                        {pendingPhotos.length === 0 && <p className="text-muted-foreground">No pending photos.</p>}
                        <div className="grid grid-cols-1 gap-4">
                            {pendingPhotos.map(p => (
                                <Card key={p.photo_id}>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="w-24 h-24 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={p.image_url} alt="User Upload" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">{p.spots?.name_en || 'Unknown Spot'}</h3>
                                            <p className="text-xs text-muted-foreground">User: {p.user_id}</p>
                                            <p className="text-xs text-muted-foreground break-all">{p.image_url}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="destructive" onClick={() => handleRejectPhoto(p.photo_id)}>Reject</Button>
                                            <Button size="sm" className="bg-green-600" onClick={() => handleApprovePhoto(p.photo_id, p.spot_id, p.image_url)}>Approve</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">Pending Corrections ({pendingCorrections.length})</h2>
                        {pendingCorrections.length === 0 && <p className="text-muted-foreground">No pending corrections.</p>}
                        <div className="grid grid-cols-1 gap-4">
                            {pendingCorrections.map(c => (
                                <Card key={c.correction_id}>
                                    <CardContent className="p-4">
                                        <h3 className="font-bold mb-2">{c.spots?.name_en || 'Unknown Spot'}</h3>
                                        <div className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32 mb-2">
                                            <pre>{JSON.stringify(c.suggested_data, null, 2)}</pre>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="destructive" onClick={() => handleRejectCorrection(c.correction_id)}>Reject</Button>
                                            <Button size="sm" className="bg-green-600" onClick={() => handleApproveCorrection(c)}>Approve</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {successMsg && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded text-center font-bold animate-bounce hidden">
                    {/* Hide global success in tab mode to allow local feedback or reuse toast later */}
                    {successMsg}
                </div>
            )}
        </div>
    );
}
