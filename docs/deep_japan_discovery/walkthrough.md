# My Route Feature Walkthrough

## Overview
Implemented the "My Route" (Journeys) feature, allowing users to create, optimize, save, and view custom travel routes.

## Changes

### 1. Database & Schema
*   Verified `journeys` table exists in Supabase.
*   Added `Journey` and `RouteData` TypeScript interfaces in `types/index.ts`.

### 2. Route Builder UI
*   **New Component**: `components/route/route-builder.tsx`
    *   Floating panel to manage selected spots.
    *   Allows setting a "Start Point".
    *   "Calculate Route" button triggers optimization.
    *   "Save Journey" button persists the route.
*   **Route Logic**: Implemented "Greedy Nearest Neighbor" algorithm to reorder spots starting from the user-selected point to minimize travel distance.
*   **Estimations**: Calculates Total Duration (Sum of Stay Times + Estimated Walking Time).

### 3. Map Integration
*   **Updated**: `components/map/map-view.tsx`
    *   Added Polyline visualization for the optimized route.
    *   Added `isRouteMode` to handle spot selection differently (Add/Remove vs View Details).
    *   Visual cues: Start point is Green and larger; Selected points are Blue; Route path is Red.
*   **Updated**: `components/map/map-provider.tsx`
    *   Enabled `routes` and `geometry` libraries in `APIProvider` to support Directions API.

### 4. Advanced Calculation (Phase 7)
*   **New Service**: `components/map/directions-service.ts`
    *   Client-side utility to interact with Google Maps Directions API.
    *   Fetches real Transit/Walking times for each leg of the journey.
*   **Enhanced UI**: `components/route/route-builder.tsx` shows detailed breakdown:
    *   Transit: "🚆 Transit • 20 min"
    *   Walking: "🚶 Walk • 5 min (300m)"
    
### 5. My Routes List
*   **New Component**: `components/route/route-list-modal.tsx`
    *   Fetches saved journeys from Supabase.
    *   Allows loading a saved journey back onto the map.
*   **Integration**: Added "My Routes" button to `app/page.tsx` next to "Create Route".

## Verification
*   **Building a Route**:
    1.  Click "Create Route".
    2.  Select multiple pins on the map.
    3.  In the panel, choose a Start Point.
    4.  Click "Calculate".
    5.  Observe the red polyline connecting spots in optimized order.
*   **Saving**:
    1.  Enter a title (e.g., "Retro Tour").
    2.  Click Save. (Requires login).
*   **Loading**:
    1.  Click "My Routes".
    2.  Select a journey.
    3.  The route is loaded and visualized on the map.

## files Created/Modified
*   [app/page.tsx](file:///Users/mukaikazuma/Desktop/Deep Japan Discovery/app/page.tsx)
*   [components/route/route-builder.tsx](file:///Users/mukaikazuma/Desktop/Deep Japan Discovery/components/route/route-builder.tsx)
*   [components/route/route-list-modal.tsx](file:///Users/mukaikazuma/Desktop/Deep Japan Discovery/components/route/route-list-modal.tsx)
*   [components/map/map-view.tsx](file:///Users/mukaikazuma/Desktop/Deep Japan Discovery/components/map/map-view.tsx)
*   [lib/location.ts](file:///Users/mukaikazuma/Desktop/Deep Japan Discovery/lib/location.ts)

## Phase 8: UX Refinements
- **Route Creation Flow**:
  - Changed pin click behavior to open "Spot Detail" first, preventing accidental adds.
  - Added dedicated "Add/Remove from Route" buttons in the detail modal.
  - Implemented auto-close behavior after adding/removing a spot.
- **Map Visualizations**:
  - Added **Heart (♥) Icons** to pins for favorite spots.
  - Added **Route Numbers (1, 2, 3...)** to pins when a route is active.
  - Fixed issue where route pins would disappear if filtered out (e.g., in "Favorites" mode).
- **External integration**:
  - Added direct "Open in Google Maps" links to Spot Cards and Detail views.

## Verification Results
- [x] Clicking a pin opens detail; "Add to Route" works and behaves as expected.
- [x] Route numbers appear correctly on the calculated path.
- [x] Heart glyphs appear on favorite spots (when not numbered).
- [x] Google Maps links open the correct coordinates.
- [x] Route spots remain visible even when "Favorites" filter is active.

## Phase 10: Unique Card ID System
- **Database**: Added `card_id` (BIGINT) to `spots` table with unique constraint and random 8-digit generation logic (10000000-99999999).
- **Monitor**: Added "Search by Card ID" input in Spot Editor tab.
  - Added "Filter by Name" input to filter the spot selection dropdown.
  - Extended filter to search within `Description` (body text) and `Address` as well.
  - Displayed `Card ID` in Spot Editor (read-only).
- **UI**: Added `Card ID` display (`#12345678`) to the Spot Card on the main list.
  - Added Copy Button (icon) next to the ID for easy copying.

### Verification Results

### Verification Results
- [x] **Local Build**: Passed (`npm run build`).
- [x] **Functionality**: Confirmed logic for ID generation (SQL) and ID search (Frontend). Admin page build successful.
- [x] **Bug Fix**: `handleSearchById` input sanitization added to handle non-numeric characters (e.g., `#`).
