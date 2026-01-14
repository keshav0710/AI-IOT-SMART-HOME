import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/services/firebase/config';

export interface UserSettings {
    sensors: {
        flameSensorEnabled: boolean;
        motionSensorEnabled: boolean;
        waterSensorEnabled: boolean;
    };
    notifications: {
        masterEnabled: boolean;
        fireAlerts: boolean;
        motionAlerts: boolean;
        timerAlerts: boolean;
    };
    automation: {
        holidayMode: boolean;
        motionAutoOffMinutes: number;
    };
    energy: {
        unitPrice: number;
        billingCycleStartDay: number;
    };
}

const defaultSettings: UserSettings = {
    sensors: { flameSensorEnabled: true, motionSensorEnabled: true, waterSensorEnabled: true },
    notifications: { masterEnabled: true, fireAlerts: true, motionAlerts: true, timerAlerts: true },
    automation: { holidayMode: false, motionAutoOffMinutes: 5 },
    energy: { unitPrice: 8.5, billingCycleStartDay: 1 },
};

export const useSettings = (userId: string | null) => {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const settingsRef = ref(database, `settings/${userId}`);
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setSettings({
                    sensors: { ...defaultSettings.sensors, ...data.sensors },
                    notifications: { ...defaultSettings.notifications, ...data.notifications },
                    automation: { ...defaultSettings.automation, ...data.automation },
                    energy: { ...defaultSettings.energy, ...data.energy },
                });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { settings, loading };
};
