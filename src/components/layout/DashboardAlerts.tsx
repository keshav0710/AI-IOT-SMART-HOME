import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Flame } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto p-4 space-y-4">
            {showOverflowAlert && (
                <Alert className="border-red-500 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">
                        <strong>Water Tank Near Overflow!</strong> Distance to water surface: {sensorData.waterLevel}
                        cm - Tank is {waterTankStatus.percentage}% full!
                    </AlertDescription>
                </Alert>
            )}

            {showEmptyAlert && (
                <Alert className="border-orange-500 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="text-orange-700">
                        <strong>Water Tank Low!</strong> Distance to water surface: {sensorData.waterLevel}cm - Please
                        refill tank soon.
                    </AlertDescription>
                </Alert>
            )}

            {showFlameAlert && (
                <Alert className="border-red-600 bg-red-100">
                    <Flame className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>FIRE DETECTED!</strong> Flame sensor has detected fire. Evacuate immediately and call
                        emergency services!
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};
