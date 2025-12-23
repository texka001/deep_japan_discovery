# Deep Japan Discovery MVP - Implementation Plan: UI & Data

## Goal
Implement the core UI components (Landing Page, Spot List, Spot Detail) and visualize real data from Supabase.

## User Review Required
- **Seed Data**: I will create a seed script to insert sample spots (Akihabara area) into the database so we have something to show.

## Proposed Changes
### Data Seeding
- [NEW] `scripts/seed-data.ts`: Script to insert sample spots into Supabase.

### Components
- [NEW] `components/spot/spot-card.tsx`: Card component for displaying spot summary.
- [NEW] `components/spot/spot-list.tsx`: Sidebar/Overlay list of spots.
- [NEW] `components/spot/spot-detail.tsx`: Modal or Drawer for spot details.
- [NEW] `components/home/filter-bar.tsx`: Category filter chips.
- [MODIFY] `components/map/map-view.tsx`: Add markers for spots.

### Pages
- [MODIFY] `app/page.tsx`: Integrate `FilterBar`, `SpotList` (overlay), and `MapView` with markers.

## Deployment Plan
### Vercel Deployment
- **Build Check**: Run `npm run build` locally to ensure no errors.
- **Environment Variables**: Configure Vercel Project Settings with:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
    - `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`
- **Deploy**: Connect GitHub repository to Vercel and deploy.

## Verification Plan
### Manual Verification
- Run seed script.
- Verify spots appear on the Map (markers).
- Verify spots appear in the List.
- Click a spot/marker to open Detail view.
- **Production Check**: Access the Vercel URL and verify all features work similarly to local.
