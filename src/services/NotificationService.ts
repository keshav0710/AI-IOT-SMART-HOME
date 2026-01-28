import { showLocalNotification, notificationTemplates, NotificationType } from '@/hooks/useFCM';
import { UserSettings } from '@/hooks/useSettings';

interface NotificationOptions {
    title: string;
    body: string;
    type: NotificationType;
    sound?: boolean;
}

class NotificationService {
    private audioContext: AudioContext | null = null;
    private settings: UserSettings['notifications'] | null = null;

    // Update notification settings
    setSettings(settings: UserSettings['notifications']) {
        this.settings = settings;
    }

    // Check if notifications are enabled for a specific type
    private isEnabled(type: NotificationType): boolean {
        if (!this.settings?.masterEnabled) return false;

        switch (type) {
            case 'fire':
                return this.settings.fireAlerts;
            case 'motion':
                return this.settings.motionAlerts;
            case 'timer':
                return this.settings.timerAlerts;
            default:
                return true;
        }
    }

    // Send notification
    send(options: NotificationOptions) {
        if (!this.isEnabled(options.type)) {
            console.log(`Notification ${options.type} is disabled in settings`);
            return;
        }

        // Show browser notification
        showLocalNotification({
            title: options.title,
            body: options.body,
            data: { type: options.type },
        });

        // Play sound for critical alerts
        if (options.sound && options.type === 'fire') {
            this.playAlertSound();
        }
    }

    // Fire alert notification
    sendFireAlert() {
        this.send({
            ...notificationTemplates.fire,
            sound: true,
        });
    }

    // Motion detection notification
    sendMotionAlert(location?: string) {
        const template = notificationTemplates.motion;
        this.send({
            title: template.title,
            body: location ? `Motion detected at ${location}` : template.body,
            type: template.type,
        });
    }

    // Timer complete notification
    sendTimerComplete(deviceName: string) {
        const template = notificationTemplates.timerComplete(deviceName);
        this.send({
            title: template.title,
            body: template.body,
            type: template.type,
        });
    }

    // Play alert sound
    private playAlertSound() {
        try {
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            const now = this.audioContext.currentTime;
            oscillator.start(now);

            // Beep pattern for fire alert
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.setValueAtTime(0, now + 0.2);
            gainNode.gain.setValueAtTime(0.3, now + 0.3);
            gainNode.gain.setValueAtTime(0, now + 0.5);
            gainNode.gain.setValueAtTime(0.3, now + 0.6);
            gainNode.gain.setValueAtTime(0, now + 0.8);

            oscillator.stop(now + 1);
        } catch (error) {
            console.error('Error playing alert sound:', error);
        }
    }
}

// Singleton instance
export const notificationService = new NotificationService();
