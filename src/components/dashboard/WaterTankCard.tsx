import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import type { WaterTankStatus } from '../../types/sensor.types';

interface WaterTankCardProps {
    waterLevel: number;
    status: WaterTankStatus;
}

export const WaterTankCard: React.FC<WaterTankCardProps> = ({ waterLevel, status }) => {
    return (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Droplets className={`w-5 h-5 ${status.color}`} />
                    <CardTitle className="text-lg">Water Tank Level</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke={
                                    status.status === 'overflow' || status.status === 'empty'
                                        ? '#ef4444'
                                        : status.status === 'low'
                                            ? '#eab308'
                                            : status.status === 'full'
                                                ? '#22c55e'
                                                : '#3b82f6'
                                }
                                strokeWidth="8"
                                strokeDasharray={`${2 * Math.PI * 50}`}
                                strokeDashoffset={`${2 * Math.PI * 50 * (1 - Math.min(status.percentage, 100) / 100)}`}
                                className="transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className={`text-2xl font-bold ${status.color}`}>
                                {Math.min(status.percentage, 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-gray-500">{waterLevel.toFixed(1)}cm</span>
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-gray-600">
                        Status:{' '}
                        <span className={`font-semibold ${status.color}`}>
                            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Distance to water: {waterLevel}cm</p>
                </div>
            </CardContent>
        </Card>
    );
};
