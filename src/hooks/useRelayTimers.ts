import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, onValue, remove } from 'firebase/database';
import { database } from '@/services/firebase/config';
import { toggleRelay } from '@/services/firebase/relay.service';
import type { RelayKey } from '@/types/sensor.types';

export interface RelayTimer {
    relayKey: RelayKey;
    endTime: number; // Unix timestamp when timer expires
    duration: number; // Original duration in seconds
    action: 'on' | 'off'; // What to do when timer expires
    createdAt: number;
}

export interface ActiveTimers {
    relay1?: RelayTimer;
    relay2?: RelayTimer;
    relay3?: RelayTimer;
    relay4?: RelayTimer;
}

interface UseRelayTimersReturn {
    activeTimers: ActiveTimers;
    remainingTimes: Record<RelayKey, number>; // Seconds remaining
    setTimer: (relayKey: RelayKey, hours: number, minutes: number, seconds: number, action: 'on' | 'off') => Promise<void>;
    cancelTimer: (relayKey: RelayKey) => Promise<void>;
    formatTime: (seconds: number) => string;
}

/**
 * Custom hook for managing relay timers with HH:MM:SS support
 */
export function useRelayTimers(userId: string | null): UseRelayTimersReturn {
    const [activeTimers, setActiveTimers] = useState<ActiveTimers>({});
    const [remainingTimes, setRemainingTimes] = useState<Record<RelayKey, number>>({
        relay1: 0,
        relay2: 0,
        relay3: 0,
        relay4: 0,
    });
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Listen to timer data from Firebase
    useEffect(() => {
        if (!userId) return;

        const timersRef = ref(database, 'timers');
        const unsubscribe = onValue(timersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setActiveTimers(data);
            } else {
                setActiveTimers({});
            }
        });

        return () => unsubscribe();
    }, [userId]);

    // Update remaining times every second
    useEffect(() => {
        const updateRemainingTimes = () => {
            const now = Date.now();
            const newRemaining: Record<RelayKey, number> = {
                relay1: 0,
                relay2: 0,
                relay3: 0,
                relay4: 0,
            };

            const relayKeys: RelayKey[] = ['relay1', 'relay2', 'relay3', 'relay4'];

            relayKeys.forEach((key) => {
                const timer = activeTimers[key];
                if (timer) {
                    const remaining = Math.max(0, Math.floor((timer.endTime - now) / 1000));
                    newRemaining[key] = remaining;

                    // Timer expired - execute action and remove timer
                    if (remaining === 0 && timer.endTime <= now) {
                        executeTimerAction(key, timer.action);
                        removeTimer(key);
                    }
                }
            });

            setRemainingTimes(newRemaining);
        };

        // Initial update
        updateRemainingTimes();

        // Update every second
        intervalRef.current = setInterval(updateRemainingTimes, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [activeTimers]);

    // Execute timer action (turn relay on/off)
    const executeTimerAction = async (relayKey: RelayKey, action: 'on' | 'off') => {
        try {
            await toggleRelay(relayKey, action === 'on');
            console.log(`⏰ Timer executed: ${relayKey} turned ${action}`);
        } catch (error) {
            console.error(`Error executing timer action for ${relayKey}:`, error);
        }
    };

    // Remove timer from Firebase
    const removeTimer = async (relayKey: RelayKey) => {
        try {
            await remove(ref(database, `timers/${relayKey}`));
        } catch (error) {
            console.error(`Error removing timer for ${relayKey}:`, error);
        }
    };

    // Set a new timer
    const setTimer = useCallback(async (
        relayKey: RelayKey,
        hours: number,
        minutes: number,
        seconds: number,
        action: 'on' | 'off'
    ): Promise<void> => {
        if (!userId) {
            console.error('User not authenticated');
            return;
        }

        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        if (totalSeconds <= 0) {
            console.error('Timer duration must be greater than 0');
            return;
        }

        const now = Date.now();
        const timer: RelayTimer = {
            relayKey,
            endTime: now + (totalSeconds * 1000),
            duration: totalSeconds,
            action,
            createdAt: now,
        };

        try {
            await set(ref(database, `timers/${relayKey}`), timer);
            console.log(`⏰ Timer set: ${relayKey} will turn ${action} in ${formatTime(totalSeconds)}`);
        } catch (error) {
            console.error(`Error setting timer for ${relayKey}:`, error);
            throw error;
        }
    }, [userId]);

    // Cancel an active timer
    const cancelTimer = useCallback(async (relayKey: RelayKey): Promise<void> => {
        try {
            await remove(ref(database, `timers/${relayKey}`));
            console.log(`⏰ Timer cancelled for ${relayKey}`);
        } catch (error) {
            console.error(`Error cancelling timer for ${relayKey}:`, error);
            throw error;
        }
    }, []);

    // Format seconds to HH:MM:SS
    const formatTime = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        activeTimers,
        remainingTimes,
        setTimer,
        cancelTimer,
        formatTime,
    };
}
