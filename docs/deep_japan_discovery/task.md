# Deep Japan Discovery - Task List

## Phase 1: MVP Setup & Basic Features
- [x] Project Initialization
    - [x] Initialize Next.js with TypeScript and Tailwind CSS
    - [x] Install and configure Shadcn/ui
    - [x] Create project structure (components, lib, types)
- [x] Supabase Integration
    - [x] Setup Supabase client
    - [x] Define Database Schema (SQL)
- [x] Map & Location Features
    - [x] Integrate Google Maps API
    - [x] Implement Geolocation (Current position)
    - [x] Implement Spot Markers on Map
    - [x] Implement 'My Location' Button
- [x] UI Implementation
    - [x] Landing Page / Home View
    - [x] Spot List View
    - [x] Spot Detail View
- [x] Deployment
    - [x] Build Check (Local)
    - [x] Push to GitHub
    - [x] Deploy to Vercel

## Phase 2: User Features (Auth & Favorites)
- [x] Authentication Setup
    - [x] Configure Supabase Auth (Email/Password)
    - [x] Create AuthProvider & Hooks
    - [x] Implement Login/Signup UI (Modal or Page)
- [x] Favorites Feature
    - [x] Create `favorites` table in Supabase
    - [x] Implement toggle favorite API/logic
    - [x] Add Favorite Button to Spot Card/Detail
    - [x] Create "My Favorites" List View

## Phase 3: Content & UI Enhancement
- [x] Database Updates
    - [x] Add `description`, `images`, `tags` to `spots` table
    - [x] Create `spot_photos` and `spot_corrections` tables
- [x] Backend / Admin
    - [x] Create Admin Page (`app/admin/page.tsx`)
    - [x] Implement Spot Generator API (`api/admin/generate-spot`) - **Powered by Gemini 2.0 Flash**
    - [x] Create Review Dashboard for UGC (Photos & Corrections)
- [x] UI Updates (Content & UGC)
    - [x] Update `SpotDetail` (Description, Gallery)
    - [x] Implement UGC Upload & Edit flows
- [x] Data Entry
    - [x] Tooling established (Spot Generator & UGC). Manual entry pending user action.

## Phase 6: My Route Feature (Journeys)
- [x] Requirements & Schema
    - [x] Verify `journeys` table existence
    - [x] Define JSON structure for `route_json`
- [x] Route Builder UI
    - [x] Implement "Route Mode" (Select/Deselect spots)
    - [x] UI to choose "Start Point" from selected spots
    - [x] "Save Route" functionality
- [x] Route Logic & Visualization
    - [x] Implement Route Optimization Algorithm (Start Node -> Nearest Neighbor)
    - [x] Display Saved Routes List
    - [x] Visualize Route on Map (Polylines)
    - [x] Calculate & Display Total Time (Stay time + Travel time estimate)

## Phase 7: Advanced Route Calculation (Transit & Walking)
- [x] Google Maps Directions Integration
    - [x] Import `useMapsLibrary('routes')` (Done via `libraries` prop in Provider)
    - [x] Implement `fetchRouteDetails` to get real API data for segments
- [x] Updated Optimization Logic
    - [x] Keep Haversine for sorting (Greedy NN)
    - [x] Calculate actual duration/distance using Directions API for the final path
    - [x] Update `calculatedRoute` state with precise data
- [x] UI Updates
    - [x] Display breakdown (Travel Time vs Stay Time)
    - [x] Show "Walking" vs "Transit" icons if available

## Phase 8: UX Refinements (Current)
- [x] Route Selection UX
    - [x] Change Pin Click to open Spot Detail (instead of toggle)
    - [x] Add "Add to Route" / "Remove from Route" button in Spot Detail
- [x] Map Markers
    - [x] Indicate "Favorite" status on Pins (Heart Icon)
    - [x] Display Route Numbers on pins (1, 2, 3...)
- [x] Spot Info
    - [x] Add "Open in Google Maps" link to Spot Card/Detail

#### Phase 9: Admin Edit Features (Current)
- [x] Create Advanced Spot Editor
    - [x] Build `SpotEditor` component for Admin Dashboard
    - [x] Implement Deep Guide editor (JSON handling)
    - [x] Integrate into `app/admin/page.tsx` (Direct Update)
    - [x] Integrate into `app/admin/page.tsx` (Direct Update)
    - [x] Push latest changes for production deployment

## Phase 10: Unique Card ID System (Current)
- [x] Database Schema
    - [x] Create migration for `card_id` column
    - [x] Implement random ID generation logic
- [x] Admin Features
    - [x] Add Search by ID to Admin Page
    - [x] Display Card ID in Spot Editor
