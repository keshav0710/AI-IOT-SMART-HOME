import { ref, get, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from './config';
import { FIREBASE_PATHS } from '../../utils/constants';
import type { SensorData } from '../../types/sensor.types';

/**
 * Get current sensor data snapshot
 */
export async function getSensorData(): Promise<Partial<SensorData> | null> {
    try {
        const snapshot = await get(ref(database, FIREBASE_PATHS.SENSORS));

        if (!snapshot.exists()) {
            return null;
        }

        const data = snapshot.val();
        return {
            waterLevel: data.distance || 0,
            voltage: data.voltage || 0,
            current: data.current || 0,
            power: data.power || 0,
            flameDetected: Boolean(data.flame),
            motionDetected: Boolean(data.motion),
            lastUpdated: data.timestamp || Date.now(),
        };
    } catch (error) {
        console.error('❌ Error getting sensor data:', error);
        return null;
    }
}

/**
 * Get water level reading
 */
export async function getWaterLevel(): Promise<number | null> {
    try {
        const snapshot = await get(ref(database, FIREBASE_PATHS.SENSOR_DISTANCE));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error('❌ Error getting water level:', error);
        return null;
    }
}

/**
 * Get all sensor data as formatted string
 */
export async function getAllSensorDataString(): Promise<string> {
    try {
        const snapshot = await get(ref(database, FIREBASE_PATHS.SENSORS));

        if (!snapshot.exists()) {
            return 'Sensor data unavailable.';
        }

        const data = snapshot.val();

        return (
            `Current system status:\n\n` +
            `* Voltage: ${data.voltage?.toFixed(1) || 'N/A'}V\n` +
            `* Current: ${data.current?.toFixed(1) || 'N/A'}A\n` +
            `* Power: ${data.power?.toFixed(1) || 'N/A'}W\n` +
            `* Flame sensor: ${data.flame ? '🔥 FIRE DETECTED!' : '✓ Safe'}\n` +
            `* Motion sensor: ${data.motion ? '👤 Motion detected' : '✓ No motion'}\n` +
            `* Water distance: ${data.distance?.toFixed(1) || 'N/A'}cm`
        );
    } catch (error) {
        console.error('❌ Error getting sensor data:', error);
        return 'Unable to fetch sensor data.';
    }
}

/**
 * Set up real-time listener for sensor data
 * @param callback - Function to call when data updates
 * @returns Cleanup function to remove listener
 */
export function listenToSensorData(
    callback: (data: Partial<SensorData>) => void,
    onError?: (error: Error) => void
): () => void {
    const sensorsRef = ref(database, FIREBASE_PATHS.SENSORS);

    const listener = onValue(
        sensorsRef,
        (snapshot: DataSnapshot) => {
            const data = snapshot.val();
            if (data) {
                callback({
                    waterLevel: data.distance || 0,
                    voltage: data.voltage || 0,
                    current: data.current || 0,
                    power: data.power || 0,
                    flameDetected: Boolean(data.flame),
                    motionDetected: Boolean(data.motion),
                    lastUpdated: data.timestamp || Date.now(),
                });
            }
        },
        (error) => {
            console.error('Error reading sensor data:', error);
            onError?.(error as Error);
        }
    );

    // Return cleanup function
    return () => {
        off(sensorsRef, 'value', listener);
    };
}

/**
 * Set up real-time listener for relay states
 * @param callback - Function to call when relay states update
 * @returns Cleanup function to remove listener
 */
export function listenToRelayStates(
    callback: (states: Record<string, boolean>) => void,
    onError?: (error: Error) => void
): () => void {
    const relaysRef = ref(database, FIREBASE_PATHS.RELAYS);

    const listener = onValue(
        relaysRef,
        (snapshot: DataSnapshot) => {
            const data = snapshot.val();
            if (data) {
                // Invert for active-low relays
                callback({
                    relay1: !Boolean(data.relay1),
                    relay2: !Boolean(data.relay2),
                    relay3: !Boolean(data.relay3),
                    relay4: !Boolean(data.relay4),
                });
            }
        },
        (error) => {
            console.error('Error reading relay data:', error);
            onError?.(error as Error);
        }
    );

    // Return cleanup function
    return () => {
        off(relaysRef, 'value', listener);
    };
}
