import { useState, useEffect, useCallback } from 'react';

export interface WeatherData {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    city: string;
    country: string;
    sunrise: number;
    sunset: number;
    condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm' | 'mist' | 'other';
}

interface UseWeatherOptions {
    refreshInterval?: number; // in milliseconds
    useGeolocation?: boolean;
    defaultCity?: string;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const DEFAULT_CITY = 'Mumbai';
const CACHE_KEY = 'smart_home_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Map OpenWeatherMap condition codes to simple conditions
const mapCondition = (id: number): WeatherData['condition'] => {
    if (id >= 200 && id < 300) return 'thunderstorm';
    if (id >= 300 && id < 600) return 'rain';
    if (id >= 600 && id < 700) return 'snow';
    if (id >= 700 && id < 800) return 'mist';
    if (id === 800) return 'clear';
    if (id > 800) return 'clouds';
    return 'other';
};

export const useWeather = (options: UseWeatherOptions = {}) => {
    const {
        refreshInterval = 30 * 60 * 1000, // 30 minutes
        useGeolocation = true,
        defaultCity = DEFAULT_CITY,
    } = options;

    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Load cached weather data
    const loadCachedWeather = useCallback((): WeatherData | null => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return data;
                }
            }
        } catch (e) {
            console.warn('Failed to load cached weather:', e);
        }
        return null;
    }, []);

    // Save weather to cache
    const cacheWeather = useCallback((data: WeatherData) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now(),
            }));
        } catch (e) {
            console.warn('Failed to cache weather:', e);
        }
    }, []);

    // Fetch weather by coordinates
    const fetchByCoords = useCallback(async (lat: number, lon: number): Promise<WeatherData | null> => {
        if (!API_KEY) {
            console.warn('OpenWeather API key not configured');
            return null;
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                city: data.name,
                country: data.sys.country,
                sunrise: data.sys.sunrise * 1000,
                sunset: data.sys.sunset * 1000,
                condition: mapCondition(data.weather[0].id),
            };
        } catch (e) {
            console.error('Error fetching weather:', e);
            throw e;
        }
    }, []);

    // Fetch weather by city name
    const fetchByCity = useCallback(async (city: string): Promise<WeatherData | null> => {
        if (!API_KEY) {
            console.warn('OpenWeather API key not configured');
            return null;
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 3.6),
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                city: data.name,
                country: data.sys.country,
                sunrise: data.sys.sunrise * 1000,
                sunset: data.sys.sunset * 1000,
                condition: mapCondition(data.weather[0].id),
            };
        } catch (e) {
            console.error('Error fetching weather:', e);
            throw e;
        }
    }, []);

    // Main fetch function
    const fetchWeather = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Try cache first
        const cached = loadCachedWeather();
        if (cached) {
            setWeather(cached);
            setLoading(false);
            setLastUpdated(new Date());
            return;
        }

        try {
            let weatherData: WeatherData | null = null;

            // Try geolocation first
            if (useGeolocation && 'geolocation' in navigator) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            enableHighAccuracy: false,
                        });
                    });

                    weatherData = await fetchByCoords(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                } catch (geoError) {
                    console.warn('Geolocation failed, falling back to default city:', geoError);
                }
            }

            // Fallback to default city
            if (!weatherData) {
                weatherData = await fetchByCity(defaultCity);
            }

            if (weatherData) {
                setWeather(weatherData);
                cacheWeather(weatherData);
                setLastUpdated(new Date());
            } else {
                setError('Unable to fetch weather data');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch weather');
        } finally {
            setLoading(false);
        }
    }, [useGeolocation, defaultCity, fetchByCoords, fetchByCity, loadCachedWeather, cacheWeather]);

    // Initial fetch and refresh interval
    useEffect(() => {
        fetchWeather();

        const interval = setInterval(fetchWeather, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchWeather, refreshInterval]);

    // Manual refresh
    const refresh = useCallback(() => {
        localStorage.removeItem(CACHE_KEY);
        fetchWeather();
    }, [fetchWeather]);

    return {
        weather,
        loading,
        error,
        lastUpdated,
        refresh,
    };
};

// Weather icon mapping for custom icons
export const getWeatherIcon = (iconCode: string): string => {
    const iconMap: Record<string, string> = {
        '01d': '☀️',
        '01n': '🌙',
        '02d': '⛅',
        '02n': '☁️',
        '03d': '☁️',
        '03n': '☁️',
        '04d': '☁️',
        '04n': '☁️',
        '09d': '🌧️',
        '09n': '🌧️',
        '10d': '🌦️',
        '10n': '🌧️',
        '11d': '⛈️',
        '11n': '⛈️',
        '13d': '❄️',
        '13n': '❄️',
        '50d': '🌫️',
        '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌡️';
};
