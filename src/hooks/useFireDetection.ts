import { useEffect, useRef } from 'react';
import { notificationService } from '@/services/NotificationService';
import { UserSettings } from '@/hooks/useSettings';

interface UseFireDetectionProps {
    flameDetected: boolean;
    settings: UserSettings;
    flameSensorEnabled: boolean;
}

export const useFireDetection = ({
    flameDetected,
    settings,
    flameSensorEnabled
}: UseFireDetectionProps) => {
    // Track if we've already sent notification for current fire event
    const hasNotifiedRef = useRef(false);
    const lastFireStateRef = useRef(false);

    useEffect(() => {
        // Update notification service settings
        notificationService.setSettings(settings.notifications);
    }, [settings.notifications]);

    useEffect(() => {
        // Don't process if sensor is disabled
        if (!flameSensorEnabled) {
            hasNotifiedRef.current = false;
            return;
        }

        // Holiday mode disables all automations including alerts
        if (settings.automation.holidayMode) {
            return;
        }

        // Fire detected transition (false -> true)
        if (flameDetected && !lastFireStateRef.current) {
            console.log('🔥 Fire detected! Sending notification...');

            if (!hasNotifiedRef.current) {
                notificationService.sendFireAlert();
                hasNotifiedRef.current = true;
            }
        }

        // Fire cleared transition (true -> false)
        if (!flameDetected && lastFireStateRef.current) {
            console.log('✅ Fire cleared');
            hasNotifiedRef.current = false;
        }

        lastFireStateRef.current = flameDetected;
    }, [flameDetected, flameSensorEnabled, settings.automation.holidayMode]);

    return {
        isFireActive: flameDetected && flameSensorEnabled,
    };
};
