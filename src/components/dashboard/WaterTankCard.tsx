import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Waves, PowerOff } from 'lucide-react';
import type { WaterTankStatus } from '../../types/sensor.types';

interface WaterTankCardProps {
    waterLevel: number;
    status: WaterTankStatus;
    sensorEnabled?: boolean;
}

export const WaterTankCard: React.FC<WaterTankCardProps> = ({ waterLevel, status, sensorEnabled = true }) => {
    // Generate color based on percentage for dynamic gradient
    const getStrokeColor = () => {
        if (!sensorEnabled) return '#9ca3af'; // Gray when disabled
        if (status.status === 'overflow' || status.status === 'empty') return '#ef4444';
        if (status.status === 'low') return '#eab308';
        if (status.status === 'full') return '#22c55e';
        return '#3b82f6';
    };

    const strokeColor = getStrokeColor();
    const percentage = sensorEnabled ? Math.min(status.percentage, 100) : 0;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Card className={`card-premium h-full overflow-hidden relative group ${!sensorEnabled ? 'opacity-70' : ''}`}>
            {/* Background Gradient Mesh */}
            <div className={`absolute inset-0 bg-gradient-to-br ${sensorEnabled ? 'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10' : 'from-gray-500/5 to-gray-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${sensorEnabled ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border-blue-200/20' : 'bg-muted border-border/50'}`}>
                            <Droplets className={`w-5 h-5 ${sensorEnabled ? status.color : 'text-muted-foreground/50'}`} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Water Monitoring
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Tank Level & Status</p>
                        </div>
                    </div>
                    {!sensorEnabled && (
                        <span className="px-2 py-1 text-[10px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-full flex items-center gap-1">
                            <PowerOff className="w-3 h-3" /> Sensor Off
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
                <div className="flex items-center justify-center py-2">
                    <div className="relative w-40 h-40 group/ring">
                        {/* Outer Glow Ring */}
                        {sensorEnabled && (
                            <div className="absolute inset-0 rounded-full blur-[20px] opacity-20 transition-opacity duration-500 group-hover/ring:opacity-40"
                                style={{ backgroundColor: strokeColor }} />
                        )}

                        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 120 120">
                            {/* Track Circle */}
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-muted/20"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke={strokeColor}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>

                        {/* Inner Content */}
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            {sensorEnabled ? (
                                <>
                                    <Waves className={`w-6 h-6 mb-1 opacity-50 ${status.color}`} />
                                    <span className={`text-3xl font-bold tracking-tight ${status.color} drop-shadow-sm`}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium mt-1">{waterLevel.toFixed(1)}cm</span>
                                </>
                            ) : (
                                <>
                                    <PowerOff className="w-8 h-8 text-muted-foreground/50 mb-2" />
                                    <span className="text-sm font-medium text-muted-foreground/50">Disabled</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl bg-muted/40 border border-border/50 text-center ${!sensorEnabled ? 'opacity-50' : ''}`}>
                        <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                        <span className={`font-semibold ${sensorEnabled ? status.color : 'text-muted-foreground'} text-sm flex items-center justify-center gap-1.5`}>
                            {sensorEnabled ? (
                                <>
                                    <span className={`w-2 h-2 rounded-full ${status.status === 'full' ? 'bg-green-500' : status.status === 'low' ? 'bg-yellow-500' : 'bg-blue-500'} animate-pulse`} />
                                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                                </>
                            ) : (
                                'N/A'
                            )}
                        </span>
                    </div>
                    <div className={`p-3 rounded-xl bg-muted/40 border border-border/50 text-center ${!sensorEnabled ? 'opacity-50' : ''}`}>
                        <p className="text-xs text-muted-foreground mb-1">Distance</p>
                        <span className="font-semibold text-foreground text-sm">
                            {sensorEnabled ? `${waterLevel} cm` : 'N/A'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
