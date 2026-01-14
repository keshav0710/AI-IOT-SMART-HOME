import React from 'react';
import { AlertTriangle, Flame, Droplets } from 'lucide-react';
import type { SensorData, WaterTankStatus } from '../../types/sensor.types';

interface DashboardAlertsProps {
    sensorData: SensorData;
    waterTankStatus: WaterTankStatus;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ sensorData, waterTankStatus }) => {
    const showOverflowAlert = waterTankStatus.status === 'overflow' && sensorData.waterLevel <= 5;
    const showEmptyAlert = waterTankStatus.status === 'empty';
    const showFlameAlert = sensorData.flameDetected;

    if (!showOverflowAlert && !showEmptyAlert && !showFlameAlert) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-4">
            {showOverflowAlert && (
                <div className="group relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 p-4 shadow-lg backdrop-blur-xl transition-all hover:bg-red-500/15">
                    <div className="absolute inset-0 bg-red-500/5 transition-opacity group-hover:opacity-20 animate-pulse-slow pointer-events-none" />
                    <div className="flex items-start gap-4 reltive z-10">
                        <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 animate-bounce" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-700 dark:text-red-400">Water Tank Near Overflow!</h3>
                            <p className="text-sm text-red-600/90 dark:text-red-400/90 mt-1">
                                Distance to water surface: {sensorData.waterLevel}cm - Tank is {waterTankStatus.percentage}% full!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showEmptyAlert && (
                <div className="group relative overflow-hidden rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 shadow-lg backdrop-blur-xl transition-all hover:bg-orange-500/15">
                    <div className="absolute inset-0 bg-orange-500/5 transition-opacity group-hover:opacity-20 pointer-events-none" />
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="p-2 bg-orange-500/20 rounded-lg shrink-0">
                            <Droplets className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-700 dark:text-orange-400">Water Tank Low!</h3>
                            <p className="text-sm text-orange-600/90 dark:text-orange-400/90 mt-1">
                                Distance to water surface: {sensorData.waterLevel}cm - Please refill tank soon.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showFlameAlert && (
                <div className="group relative overflow-hidden rounded-xl border border-red-600/30 bg-red-600/10 p-4 shadow-[0_0_30px_rgba(220,38,38,0.2)] backdrop-blur-xl transition-all hover:bg-red-600/20 animate-pulse">
                    <div className="absolute inset-0 bg-red-600/10 transition-opacity animate-pulse pointer-events-none" />
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="p-2 bg-red-600/20 rounded-lg shrink-0 animate-bounce">
                            <Flame className="h-6 w-6 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-red-700 dark:text-red-500">FIRE DETECTED!</h3>
                            <p className="text-sm font-medium text-red-600/90 dark:text-red-400/90 mt-1">
                                Flame sensor has detected fire. Evacuate immediately and call emergency services!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
