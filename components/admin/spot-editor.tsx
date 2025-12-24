'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Spot } from '@/types';

interface SpotEditorProps {
    spot: Spot;
    onSave: (updatedSpot: Partial<Spot>) => Promise<void>;
    onCancel: () => void;
}

export function SpotEditor({ spot, onSave, onCancel }: SpotEditorProps) {
    const [formData, setFormData] = useState<Partial<Spot>>({});
    const [loading, setLoading] = useState(false);
    const [deepGuide, setDeepGuide] = useState<any>({});

    useEffect(() => {
        setFormData({ ...spot });
        setDeepGuide(spot.deep_guide_json || {});
    }, [spot]);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Merge deep guide back into formData
            const finalData = {
                ...formData,
                deep_guide_json: deepGuide
            };
            await onSave(finalData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCommCard = () => {
        const cards = deepGuide.communication_cards || [];
        setDeepGuide({
            ...deepGuide,
            communication_cards: [...cards, { label: 'New Card', jp: '' }]
        });
    };

    const handleUpdateCommCard = (idx: number, field: 'label' | 'jp', value: string) => {
        const cards = [...(deepGuide.communication_cards || [])];
        cards[idx] = { ...cards[idx], [field]: value };
        setDeepGuide({ ...deepGuide, communication_cards: cards });
    };

    const handleRemoveCommCard = (idx: number) => {
        const cards = [...(deepGuide.communication_cards || [])];
        cards.splice(idx, 1);
        setDeepGuide({ ...deepGuide, communication_cards: cards });
    };

    return (
        <Card>
            <CardContent className="p-6">
                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="deepguide">Deep Guide</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Name (EN)</Label>
                                <Input
                                    value={formData.name_en || ''}
                                    onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Name (JP)</Label>
                                <Input
                                    value={formData.name_jp || ''}
                                    onChange={e => setFormData({ ...formData, name_jp: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Address</Label>
                            <Input
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                className="min-h-[100px]"
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Category</Label>
                                <select
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.category || 'Other'}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
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
                                <Label>Difficulty (1-3)</Label>
                                <Input
                                    type="number"
                                    min={1} max={3}
                                    value={formData.difficulty || 1}
                                    onChange={e => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Avg Stay (min)</Label>
                                <Input
                                    type="number"
                                    value={formData.avg_stay_minutes || 30}
                                    onChange={e => setFormData({ ...formData, avg_stay_minutes: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Image URL (Cover)</Label>
                            <Input
                                value={formData.image_url || ''}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="deepguide" className="space-y-6">
                        <div className="space-y-4 border p-4 rounded-md bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-semibold text-lg">Rules & Guide</h3>
                            <div>
                                <Label className="text-blue-600 dark:text-blue-400">How to Enter</Label>
                                <Textarea
                                    placeholder="Explain how to enter the shop..."
                                    value={deepGuide.how_to_enter || ''}
                                    onChange={e => setDeepGuide({ ...deepGuide, how_to_enter: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label className="text-red-600 dark:text-red-400">Must-Follow Rules</Label>
                                <Textarea
                                    placeholder="List critical rules (e.g. No Photography)..."
                                    value={deepGuide.must_follow_rules || ''}
                                    onChange={e => setDeepGuide({ ...deepGuide, must_follow_rules: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 border p-4 rounded-md bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Communication Cards</h3>
                                <Button size="sm" variant="outline" onClick={handleAddCommCard}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Card
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {deepGuide.communication_cards?.map((card: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-start p-2 border rounded bg-white dark:bg-black">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Label (e.g. Can I take photos?)"
                                                value={card.label}
                                                onChange={e => handleUpdateCommCard(idx, 'label', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Japanese (e.g. 写真を撮ってもいいですか？)"
                                                value={card.jp}
                                                onChange={e => handleUpdateCommCard(idx, 'jp', e.target.value)}
                                            />
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveCommCard(idx)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {(!deepGuide.communication_cards || deepGuide.communication_cards.length === 0) && (
                                    <p className="text-sm text-gray-400 text-center py-4">No cards added yet.</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
