import { ref, set, get } from 'firebase/database';
import { database } from './config';
import { RELAY_CONFIG } from '../../utils/constants';
import type { RelayKey } from '../../types/sensor.types';

/**
 * Toggle a relay on or off
 * @param relayKey - The relay to toggle (relay1, relay2, relay3, relay4)
 * @param state - Optional: true for ON, false for OFF. If not provided, toggles current state
 */
export async function toggleRelay(relayKey: RelayKey, state?: boolean): Promise<void> {
    try {
        const relayRef = ref(database, `relays/${relayKey}`);

        let newState: boolean;

        if (state !== undefined) {
            newState = state;
        } else {
            // Get current state and toggle
            const snapshot = await get(relayRef);
            const currentState = snapshot.exists() ? !snapshot.val() : false;
            newState = !currentState;
        }

        // Invert logic for active-low relays (false = ON, true = OFF)
        const firebaseValue = RELAY_CONFIG.ACTIVE_LOW ? !newState : newState;

        await set(relayRef, firebaseValue);
        console.log(`✅ ${relayKey} set to ${firebaseValue} (Logical: ${newState ? 'ON' : 'OFF'})`);
    } catch (error) {
        console.error(`❌ Error toggling ${relayKey}:`, error);
        throw error;
    }
}

/**
 * Get the current status of a relay
 * @param relayKey - The relay to check
 * @returns 'on', 'off', or 'unknown'
 */
export async function getRelayStatus(relayKey: RelayKey): Promise<'on' | 'off' | 'unknown'> {
    try {
        const relayRef = ref(database, `relays/${relayKey}`);
        const snapshot = await get(relayRef);

        if (!snapshot.exists()) {
            console.warn(`⚠️ ${relayKey} status unknown`);
            return 'unknown';
        }

        const firebaseValue = snapshot.val();

        // Convert based on active-low configuration
        const isOn = RELAY_CONFIG.ACTIVE_LOW
            ? (firebaseValue === false || firebaseValue === 0)
            : (firebaseValue === true || firebaseValue === 1);

        return isOn ? 'on' : 'off';
    } catch (error) {
        console.error(`❌ Error getting ${relayKey} status:`, error);
        return 'unknown';
    }
}

/**
 * Turn off all relays
 */
export async function turnOffAllRelays(): Promise<void> {
    try {
        console.log('🔌 Turning off all devices...');
        const offValue = RELAY_CONFIG.ACTIVE_LOW ? true : false;

        await Promise.all([
            set(ref(database, 'relays/relay1'), offValue),
            set(ref(database, 'relays/relay2'), offValue),
            set(ref(database, 'relays/relay3'), offValue),
            set(ref(database, 'relays/relay4'), offValue),
        ]);

        console.log('✅ All devices turned off');
    } catch (error) {
        console.error('❌ Error turning off devices:', error);
        throw error;
    }
}

/**
 * Turn on all relays (excluding relay4)
 */
export async function turnOnAllRelays(): Promise<void> {
    try {
        console.log('💡 Turning on all devices...');
        const onValue = RELAY_CONFIG.ACTIVE_LOW ? false : true;

        await Promise.all([
            set(ref(database, 'relays/relay1'), onValue),
            set(ref(database, 'relays/relay2'), onValue),
            set(ref(database, 'relays/relay3'), onValue),
        ]);

        console.log('✅ All devices turned on');
    } catch (error) {
        console.error('❌ Error turning on devices:', error);
        throw error;
    }
}
