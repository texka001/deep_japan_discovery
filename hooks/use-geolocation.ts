
import { useState, useEffect } from 'react';

type Location = {
    lat: number;
    lng: number;
};

type GeolocationError = {
    code: number;
    message: string;
};

export const useGeolocation = () => {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<GeolocationError | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const getLocation = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            setError({ code: 0, message: 'Geolocation is not supported by your browser' });
            setLoading(false);
            return;
        }

        const successHandler = (position: GeolocationPosition) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
            setError(null);
            setLoading(false);
        };

        const errorHandler = (err: GeolocationPositionError) => {
            setError({ code: err.code, message: err.message });
            setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
    };

    useEffect(() => {
        getLocation();
    }, []);

    return { location, error, loading, getLocation };
};
