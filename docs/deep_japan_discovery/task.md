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
