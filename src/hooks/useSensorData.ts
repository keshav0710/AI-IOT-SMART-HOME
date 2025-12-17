import { useState, useEffect } from 'react';
import { listenToSensorData } from '../services/firebase/database.service';
import type { SensorData } from '../types/sensor.types';

interface UseSensorDataReturn {
    sensorData: SensorData;
    connectionStatus: string;
}

/**
 * Custom hook for real-time sensor data from Firebase
 */
export function useSensorData(userId: string | null): UseSensorDataReturn {
    const [sensorData, setSensorData] = useState<SensorData>({
        waterLevel: 0,
        voltage: 0,
        current: 0,
        power: 0,
        flameDetected: false,
        motionDetected: false,
        lastUpdated: Date.now(),
    });

    const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

    useEffect(() => {
        if (!userId) {
            setConnectionStatus('Not authenticated');
            return;
        }

        setConnectionStatus('Connected');

        const cleanup = listenToSensorData(
            (data) => {
                setSensorData((prev) => ({
                    ...prev,
                    ...data,
                }));
                setConnectionStatus('Live - Data Updated');
            },
            (error) => {
                console.error('Error reading sensor data:', error);
                setConnectionStatus('Error - Check connection');
            }
        );

        return cleanup;
    }, [userId]);

    return { sensorData, connectionStatus };
}
