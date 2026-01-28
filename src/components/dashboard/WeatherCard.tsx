import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Droplets, Wind, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeatherData, getWeatherIcon } from '@/hooks/useWeather';

interface WeatherCardProps {
    weather: WeatherData | null;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    onRefresh: () => void;
}

// Get weather icon component based on condition
const getWeatherIconComponent = (condition: WeatherData['condition'], className: string = "w-8 h-8") => {
    switch (condition) {
        case 'clear':
            return <Sun className={`${className} text-yellow-500`} />;
        case 'clouds':
            return <Cloud className={`${className} text-gray-400`} />;
        case 'rain':
            return <CloudRain className={`${className} text-blue-400`} />;
        case 'snow':
            return <CloudSnow className={`${className} text-blue-200`} />;
        case 'thunderstorm':
            return <CloudLightning className={`${className} text-yellow-600`} />;
        case 'mist':
            return <CloudFog className={`${className} text-gray-300`} />;
        default:
            return <Cloud className={`${className} text-gray-400`} />;
    }
};

export const WeatherCard: React.FC<WeatherCardProps> = ({
    weather,
    loading,
    error,
    lastUpdated,
    onRefresh,
}) => {
    return (
        <Card className="card-premium relative overflow-hidden group">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border border-blue-200/20">
                            <Cloud className="w-4 h-4 text-blue-500" />
                        </div>
                        <CardTitle className="text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Weather
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-8 w-8 p-0"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                {loading && !weather && (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {error && !weather && (
                    <div className="text-center py-8">
                        <Cloud className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {weather && (
                    <div className="space-y-3">
                        {/* Main temperature display */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-muted/50 dark:bg-muted/30">
                                    {getWeatherIconComponent(weather.condition, "w-10 h-10")}
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-foreground">
                                        {weather.temperature}°C
                                    </div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                        {weather.description}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl">
                                    {getWeatherIcon(weather.icon)}
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{weather.city}, {weather.country}</span>
                        </div>

                        {/* Additional info */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                            <div className="text-center p-2 rounded-lg bg-muted/30">
                                <div className="text-xs text-muted-foreground mb-1">Feels Like</div>
                                <div className="text-sm font-medium">{weather.feelsLike}°C</div>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-muted/30">
                                <Droplets className="w-3 h-3 inline-block mr-1 text-blue-400" />
                                <div className="text-xs text-muted-foreground mb-1">Humidity</div>
                                <div className="text-sm font-medium">{weather.humidity}%</div>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-muted/30">
                                <Wind className="w-3 h-3 inline-block mr-1 text-gray-400" />
                                <div className="text-xs text-muted-foreground mb-1">Wind</div>
                                <div className="text-sm font-medium">{weather.windSpeed} km/h</div>
                            </div>
                        </div>

                        {/* Last updated */}
                        {lastUpdated && (
                            <div className="text-[10px] text-muted-foreground/60 text-center pt-1">
                                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
