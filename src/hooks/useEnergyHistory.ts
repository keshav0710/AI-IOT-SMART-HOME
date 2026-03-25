import { useState, useEffect, useRef } from 'react';
import { ref, push, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { database } from '@/services/firebase/config';

export interface EnergyReading {
  timestamp: number;
  power: number;
  voltage: number;
  current: number;
  totalEnergyKwh: number;
}

export interface UseEnergyHistoryReturn {
  history: EnergyReading[];
  isLoading: boolean;
}

const RECORD_INTERVAL_MS = 30_000; // record a snapshot every 30 seconds
const MAX_POINTS = 48;             // keep last 48 readings (~24 min of data)

/**
 * Hook: persists sensor readings to Firebase energy history and reads them back.
 *
 * KEY FIX: sensor values are kept in a ref so the recording interval
 * never restarts on every Firebase update — only userId changes restart it.
 */
export function useEnergyHistory(
  userId: string | null,
  livePower: number,
  liveVoltage: number,
  liveCurrent: number,
  liveTotalEnergy: number,
): UseEnergyHistoryReturn {
  const [history, setHistory] = useState<EnergyReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Always hold the latest sensor values without re-running the interval effect
  const latestValues = useRef({ livePower, liveVoltage, liveCurrent, liveTotalEnergy });
  useEffect(() => {
    latestValues.current = { livePower, liveVoltage, liveCurrent, liveTotalEnergy };
  }, [livePower, liveVoltage, liveCurrent, liveTotalEnergy]);

  // ── Read history from Firebase ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const histRef = query(
      ref(database, `energyHistory/${userId}`),
      orderByChild('timestamp'),
      limitToLast(MAX_POINTS),
    );

    const unsubscribe = onValue(histRef, (snap) => {
      if (snap.exists()) {
        const raw = snap.val() as Record<string, EnergyReading>;
        const readings = Object.values(raw).sort((a, b) => a.timestamp - b.timestamp);
        setHistory(readings);
      } else {
        setHistory([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // ── Stable recording interval — depends ONLY on userId ──────────────────────
  useEffect(() => {
    if (!userId) return;

    const record = async () => {
      const { livePower, liveVoltage, liveCurrent, liveTotalEnergy } = latestValues.current;

      // Don't record while sensor data hasn't loaded yet (all zeros)
      if (livePower === 0 && liveVoltage === 0 && liveCurrent === 0) return;

      const reading: EnergyReading = {
        timestamp: Date.now(),
        power: livePower,
        voltage: liveVoltage,
        current: liveCurrent,
        totalEnergyKwh: liveTotalEnergy,
      };

      try {
        await push(ref(database, `energyHistory/${userId}`), reading);
      } catch (err) {
        console.error('Error saving energy reading:', err);
      }
    };

    // Wait 5 s after mount before first record (let Firebase data arrive)
    const initialDelay = setTimeout(record, 5_000);

    // Then record on a fixed 30-second cadence
    const interval = setInterval(record, RECORD_INTERVAL_MS);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [userId]); // ← sensor values are read from the ref, NOT listed here

  return { history, isLoading };
}
