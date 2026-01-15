import { useEffect, useRef, useCallback } from 'react';
import { turnOnAllRelays, turnOffAllRelays } from '@/services/firebase/relay.service';
import type { SensorData } from '@/types/sensor.types';

interface UseMotionAutomationProps {
    sensorData: SensorData;
    motionSensorEnabled: boolean;
    motionAutoEnabled: boolean;
    autoOffMinutes: number;
    holidayMode: boolean;
}

interface UseMotionAutomationReturn {
    isMotionActive: boolean;
    lastMotionTime: number | null;
    autoOffCountdown: number;
}

/**
 * Custom hook for motion-triggered light automation
 * - When motion detected → turn on all lights
 * - After no motion for X minutes → turn off all lights
 */
export function useMotionAutomation({
    sensorData,
    motionSensorEnabled,
    motionAutoEnabled,
    autoOffMinutes,
    holidayMode,
}: UseMotionAutomationProps): UseMotionAutomationReturn {
    const lastMotionTimeRef = useRef<number | null>(null);
    const autoOffTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lightsOnRef = useRef(false);

    // Handle motion detection and automation
    useEffect(() => {
        // Skip if disabled or in holiday mode
        if (!motionSensorEnabled || !motionAutoEnabled || holidayMode) {
            return;
        }

        const { motionDetected } = sensorData;

        if (motionDetected) {
            // Motion detected - update last motion time
            lastMotionTimeRef.current = Date.now();

            // Clear any pending auto-off timer
            if (autoOffTimeoutRef.current) {
                clearTimeout(autoOffTimeoutRef.current);
                autoOffTimeoutRef.current = null;
            }

            // Turn on lights if not already on
            if (!lightsOnRef.current) {
                console.log('🚶 Motion detected - turning on lights');
                turnOnAllRelays()
                    .then(() => {
                        lightsOnRef.current = true;
                    })
                    .catch((err) => {
                        console.error('Error turning on lights for motion:', err);
                    });
            }
        } else {
            // No motion - start auto-off countdown if lights are on
            if (lightsOnRef.current && !autoOffTimeoutRef.current) {
                const autoOffMs = autoOffMinutes * 60 * 1000;
                console.log(`⏱️ No motion - lights will turn off in ${autoOffMinutes} minutes`);

                autoOffTimeoutRef.current = setTimeout(() => {
                    console.log('💤 Auto-off timer expired - turning off lights');
                    turnOffAllRelays()
                        .then(() => {
                            lightsOnRef.current = false;
                        })
                        .catch((err) => {
                            console.error('Error turning off lights:', err);
                        });
                    autoOffTimeoutRef.current = null;
                }, autoOffMs);
            }
        }

        return () => {
            if (autoOffTimeoutRef.current) {
                clearTimeout(autoOffTimeoutRef.current);
            }
        };
    }, [sensorData.motionDetected, motionSensorEnabled, motionAutoEnabled, autoOffMinutes, holidayMode]);

    // Calculate auto-off countdown
    const getAutoOffCountdown = useCallback((): number => {
        if (!lastMotionTimeRef.current || lightsOnRef.current === false) {
            return 0;
        }
        const elapsed = (Date.now() - lastMotionTimeRef.current) / 1000;
        const remaining = Math.max(0, (autoOffMinutes * 60) - elapsed);
        return Math.floor(remaining);
    }, [autoOffMinutes]);

    return {
        isMotionActive: sensorData.motionDetected,
        lastMotionTime: lastMotionTimeRef.current,
        autoOffCountdown: getAutoOffCountdown(),
    };
}
