import { useState, useEffect, useCallback } from 'react';
import { messaging, getToken, onMessage } from '@/firebase';
import { ref, set } from 'firebase/database';
import { database } from '@/services/firebase/config';

interface FCMState {
    token: string | null;
    permission: NotificationPermission;
    isSupported: boolean;
    error: string | null;
}

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

// VAPID key for FCM - you need to generate this from Firebase Console
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

export const useFCM = (userId: string | null) => {
    const [state, setState] = useState<FCMState>({
        token: null,
        permission: 'default',
        isSupported: false,
        error: null,
    });

    // Check if FCM is supported
    useEffect(() => {
        const isSupported =
            typeof window !== 'undefined' &&
            'Notification' in window &&
            'serviceWorker' in navigator &&
            messaging !== null;

        setState(prev => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : 'denied'
        }));
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!state.isSupported) {
            setState(prev => ({ ...prev, error: 'Notifications not supported' }));
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            setState(prev => ({ ...prev, permission }));

            if (permission === 'granted') {
                await getTokenAndSave();
                return true;
            } else {
                setState(prev => ({ ...prev, error: 'Notification permission denied' }));
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            setState(prev => ({ ...prev, error: 'Failed to request permission' }));
            return false;
        }
    }, [state.isSupported]);

    // Get FCM token and save to Firebase
    const getTokenAndSave = useCallback(async () => {
        if (!messaging || !userId) return null;

        try {
            // Register service worker first
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);

            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            if (token) {
                console.log('FCM Token:', token);
                setState(prev => ({ ...prev, token, error: null }));

                // Save token to Firebase
                await set(ref(database, `fcmTokens/${userId}`), {
                    token,
                    lastUpdated: Date.now(),
                    platform: navigator.platform,
                    userAgent: navigator.userAgent.substring(0, 100),
                });

                return token;
            } else {
                setState(prev => ({ ...prev, error: 'Failed to get FCM token' }));
                return null;
            }
        } catch (error) {
            console.error('Error getting FCM token:', error);
            setState(prev => ({ ...prev, error: 'Failed to get FCM token' }));
            return null;
        }
    }, [userId]);

    // Listen for foreground messages
    useEffect(() => {
        if (!messaging || state.permission !== 'granted') return;

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);

            // Show notification using Notification API (for foreground)
            if (payload.notification) {
                showLocalNotification({
                    title: payload.notification.title || 'Smart Home Alert',
                    body: payload.notification.body || '',
                    data: payload.data,
                });
            }
        });

        return () => unsubscribe();
    }, [state.permission]);

    // Auto-request permission and get token when user is logged in
    useEffect(() => {
        if (userId && state.isSupported && state.permission === 'default') {
            // Don't auto-request on mount, let user trigger it
        } else if (userId && state.isSupported && state.permission === 'granted' && !state.token) {
            getTokenAndSave();
        }
    }, [userId, state.isSupported, state.permission, state.token, getTokenAndSave]);

    return {
        ...state,
        requestPermission,
        refreshToken: getTokenAndSave,
    };
};

// Show local browser notification
export const showLocalNotification = (payload: NotificationPayload) => {
    if (Notification.permission !== 'granted') return;

    const notification = new Notification(payload.title, {
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.type || 'smart-home',
        data: payload.data,
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    return notification;
};

// Notification types for smart home
export type NotificationType = 'fire' | 'motion' | 'timer' | 'device' | 'general';

// Pre-built notification templates
export const notificationTemplates = {
    fire: {
        title: '🔥 FIRE ALERT!',
        body: 'Fire detected! Please check immediately.',
        type: 'fire' as NotificationType,
    },
    motion: {
        title: '🚶 Motion Detected',
        body: 'Motion detected in your home.',
        type: 'motion' as NotificationType,
    },
    timerComplete: (deviceName: string) => ({
        title: '⏰ Timer Complete',
        body: `${deviceName} timer has completed.`,
        type: 'timer' as NotificationType,
    }),
    deviceOffline: (deviceName: string) => ({
        title: '⚠️ Device Offline',
        body: `${deviceName} has gone offline.`,
        type: 'device' as NotificationType,
    }),
};
