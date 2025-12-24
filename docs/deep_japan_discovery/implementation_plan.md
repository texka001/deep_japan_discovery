# Deep Japan Discovery MVP - Implementation Plan: UI & Data

## Phase 1: MVP (Completed)
- [x] Basic UI (Home, List, Detail)
- [x] Map Integration (Markers, Geolocation)
- [x] Supabase Setup & Seeding
- [x] Vercel Deployment

# Phase 2: User Features (Auth & Favorites)

## Goal
Allow users to sign up/login and save their favorite spots.

## Proposed Changes
### Database Schema
- [NEW] `public.favorites` table:
    - `favorite_id` (uuid, pk)
    - `user_id` (uuid, fk to auth.users)
    - `spot_id` (uuid, fk to spots)
    - `created_at` (timestamp, timezone('utc', now()))
- [NEW] RLS Policies for `favorites`:
    - Select: Users can see their own favorites.
    - Insert: Users can add favorites.
    - Delete: Users can remove favorites.

### Authentication
- [NEW] `components/auth/auth-provider.tsx`: Context to manage user session.
- [NEW] `components/auth/login-modal.tsx`: Simple email/password login form using Supabase Auth UI or custom form.
- [NEW] `hooks/use-auth.ts`: Hook to access user and auth methods.

### UI Enhancements
- [MODIFY] `components/spot/spot-card.tsx`: Add "Heart" icon. filled=favorited, outline=not favorited.
- [MODIFY] `components/spot/spot-detail.tsx`: Add "Heart" button in header.
- [MODIFY] `app/page.tsx`:
    - Add "Login" button in header (if not logged in).
    - Add "My Favorites" filter/tab (if logged in).

## Verification Plan
### Manual Verification
- **Auth**: Test Sign Up, Login, Logout flows.
- **Favorites**:
    - Click heart -> changes to filled.
    - Reload page -> remains filled.
    - Click again -> changes to outline (removed).
    - Check "My Favorites" list -> shows only favorited spots.
