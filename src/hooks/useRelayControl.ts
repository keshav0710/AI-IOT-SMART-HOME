import { useState, useEffect, useCallback } from 'react';
import { listenToRelayStates } from '../services/firebase/database.service';
import { toggleRelay as toggleRelayService } from '../services/firebase/relay.service';
import type { RelayStates, RelayKey } from '../types/sensor.types';

interface UseRelayControlReturn {
    relayStates: RelayStates;
    toggleRelay: (relayKey: RelayKey) => Promise<void>;
}

/**
 * Custom hook for relay control with real-time state updates
 */
export function useRelayControl(userId: string | null): UseRelayControlReturn {
    const [relayStates, setRelayStates] = useState<RelayStates>({
        relay1: false,
        relay2: false,
        relay3: false,
        relay4: false,
    });

    useEffect(() => {
        if (!userId) return;

        const cleanup = listenToRelayStates(
            (states) => {
                setRelayStates(states);
            },
            (error) => {
                console.error('Error reading relay data:', error);
            }
        );

        return cleanup;
    }, [userId]);

    const toggleRelay = useCallback(async (relayKey: RelayKey): Promise<void> => {
        if (!userId) {
            console.error('User not authenticated');
            return;
        }

        try {
            const newState = !relayStates[relayKey];
            await toggleRelayService(relayKey, newState);
        } catch (error) {
            console.error(`Error toggling ${relayKey}:`, error);
        }
    }, [userId, relayStates]);

    return { relayStates, toggleRelay };
}
