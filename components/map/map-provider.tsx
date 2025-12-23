
'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export const MapProvider = ({ children }: { children: ReactNode }) => {
    if (!API_KEY) {
        return <div>Google Maps API Key is missing.</div>;
    }

    return (
        <APIProvider apiKey={API_KEY}>
            {children}
        </APIProvider>
    );
};
