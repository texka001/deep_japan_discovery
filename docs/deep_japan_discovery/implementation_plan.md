# Phase 9: Admin Edit Features

## Goal
Implement a "Spot Editor" within the Admin Dashboard to allow full editing of spot content, including the JSON "Deep Guide".

## Proposed Changes

### 1. Admin Dashboard Update
#### [MODIFY] [app/admin/page.tsx](file:///app/admin/page.tsx)
- Add a new Tab: "Spot Editor" (alongside "Spot Generator" and "UGC Review").
- In this tab:
  - Add a **Spot Selector** (ComboBox or Select) to choose an existing spot.
  - Render the `SpotEditor` component when a spot is selected.

### 2. Spot Editor Component
#### [NEW] [components/admin/spot-editor.tsx](file:///components/admin/spot-editor.tsx)
- **Props**: `spot: Spot`, `onSave: (updatedSpot) => Promise<void>`
- **UI Layout**:
  - **Tabs**: "Basic Info" | "Deep Guide" | "Images"
- **Fields**:
  - **Basic**: Name (EN/JP), Location (lat/lng or map picker?), Category, Difficulty, Stay Time.
  - **Deep Guide**: Textareas for Rules/Entry. Dynamic list for Communication Cards.
  - **Images**: Simple URL input or (future) uploader.
- **Action**:
  - "Save Changes" button -> Updates `public.spots` table directly via Supabase.

## Verification Plan
1. Navigate to `/admin` (ensure logged in as admin/pro).
2. Click "Spot Editor" tab.
3. Select a spot (e.g., "Super Potato").
4. Edit the description or add a rule.
5. Click Save.
6. Verify the change is reflected on the main map.
