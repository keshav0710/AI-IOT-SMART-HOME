import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Zap, Bell, Shield, User, Moon, Sun, Radio, CalendarOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/services/firebase/config';

interface SettingsState {
    general: {
        darkMode: boolean;
    };
    energy: {
        unitPrice: number;
        billingCycleStartDay: number;
    };
    automation: {
        holidayMode: boolean;
        motionLightsEnabled: boolean;
        motionAutoOffMinutes: number;
    };
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
}

const defaultSettings: SettingsState = {
    general: { darkMode: false },
    energy: { unitPrice: 8.5, billingCycleStartDay: 1 },
    automation: { holidayMode: false, motionLightsEnabled: true, motionAutoOffMinutes: 5 },
    sensors: { flameSensorEnabled: true, motionSensorEnabled: true, waterSensorEnabled: true },
    notifications: { masterEnabled: true, fireAlerts: true, motionAlerts: true, timerAlerts: true },
};

type SettingsTab = 'general' | 'energy' | 'automation' | 'sensors' | 'notifications';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [settings, setSettings] = useState<SettingsState>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        const settingsRef = ref(database, `settings/${user.uid}`);
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                setSettings({ ...defaultSettings, ...snapshot.val() });
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const updateSetting = <T extends keyof SettingsState>(
        category: T,
        key: keyof SettingsState[T],
        value: SettingsState[T][keyof SettingsState[T]]
    ) => {
        if (!user) return;
        const newSettings = { ...settings, [category]: { ...settings[category], [key]: value } };
        setSettings(newSettings);
        set(ref(database, `settings/${user.uid}/${category}/${String(key)}`), value);
    };

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General', icon: <User className="w-4 h-4" /> },
        { id: 'energy', label: 'Energy', icon: <Zap className="w-4 h-4" /> },
        { id: 'automation', label: 'Automation', icon: <CalendarOff className="w-4 h-4" /> },
        { id: 'sensors', label: 'Sensors', icon: <Radio className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> General Settings</CardTitle>
                            <CardDescription>Manage your profile and appearance.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                                <Label className="text-sm text-muted-foreground">Logged in as</Label>
                                <p className="font-medium text-foreground">{user?.email}</p>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                                    <div>
                                        <Label className="font-semibold">Dark Mode</Label>
                                        <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
                                    </div>
                                </div>
                                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'energy':
                return (
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Energy Settings</CardTitle>
                            <CardDescription>Configure electricity rate and billing cycle.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="unitPrice" className="font-semibold">Electricity Unit Price (₹/kWh)</Label>
                                <Input
                                    id="unitPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={settings.energy.unitPrice}
                                    key={settings.energy.unitPrice} // Force re-render when value changes from Firebase
                                    onBlur={(e) => {
                                        const value = parseFloat(e.target.value);
                                        if (!isNaN(value) && value >= 0) {
                                            updateSetting('energy', 'unitPrice', value);
                                        }
                                    }}
                                    className="max-w-xs bg-background/50 border-border/50"
                                />
                                <p className="text-xs text-muted-foreground">Set the price per unit of electricity for cost estimations.</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="billingDay" className="font-semibold">Billing Cycle Start Day</Label>
                                <Input
                                    id="billingDay"
                                    type="number"
                                    min="1"
                                    max="28"
                                    value={settings.energy.billingCycleStartDay}
                                    onChange={(e) => updateSetting('energy', 'billingCycleStartDay', parseInt(e.target.value) || 1)}
                                    className="max-w-xs bg-background/50 border-border/50"
                                />
                                <p className="text-xs text-muted-foreground">The day of the month your billing cycle starts.</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'automation':
                return (
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CalendarOff className="w-5 h-5 text-orange-500" /> Automation Settings</CardTitle>
                            <CardDescription>Control automations and holiday mode.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <div>
                                    <Label className="font-semibold text-orange-600 dark:text-orange-400">Holiday Mode</Label>
                                    <p className="text-xs text-muted-foreground">Pause all automations while you're away.</p>
                                </div>
                                <Switch
                                    checked={settings.automation.holidayMode}
                                    onCheckedChange={(v) => updateSetting('automation', 'holidayMode', v)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                                <div>
                                    <Label className="font-semibold">Motion-Activated Lights</Label>
                                    <p className="text-xs text-muted-foreground">Automatically turn on lights when motion is detected.</p>
                                </div>
                                <Switch
                                    checked={settings.automation.motionLightsEnabled}
                                    onCheckedChange={(v) => updateSetting('automation', 'motionLightsEnabled', v)}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-semibold">Motion Auto-Off Timer: {settings.automation.motionAutoOffMinutes} min</Label>
                                <Slider
                                    value={[settings.automation.motionAutoOffMinutes]}
                                    onValueChange={(v) => updateSetting('automation', 'motionAutoOffMinutes', v[0])}
                                    min={1}
                                    max={30}
                                    step={1}
                                    className="max-w-md"
                                />
                                <p className="text-xs text-muted-foreground">How long lights stay on after motion stops.</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'sensors':
                return (
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Radio className="w-5 h-5 text-blue-500" /> Sensor Management</CardTitle>
                            <CardDescription>Enable or disable individual sensor inputs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'flameSensorEnabled' as const, label: 'Flame Sensor', desc: 'Detect fire and smoke.' },
                                { key: 'motionSensorEnabled' as const, label: 'Motion Sensor', desc: 'Detect movement for automations.' },
                                { key: 'waterSensorEnabled' as const, label: 'Water Sensor', desc: 'Monitor water tank levels.' },
                            ].map((sensor) => (
                                <div key={sensor.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                                    <div>
                                        <Label className="font-semibold">{sensor.label}</Label>
                                        <p className="text-xs text-muted-foreground">{sensor.desc}</p>
                                    </div>
                                    <Switch
                                        checked={settings.sensors[sensor.key]}
                                        onCheckedChange={(v) => updateSetting('sensors', sensor.key, v)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );
            case 'notifications':
                return (
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-purple-500" /> Notification Settings</CardTitle>
                            <CardDescription>Manage your notification preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <div>
                                    <Label className="font-semibold text-purple-600 dark:text-purple-400">Master Toggle</Label>
                                    <p className="text-xs text-muted-foreground">Enable or disable all notifications globally.</p>
                                </div>
                                <Switch
                                    checked={settings.notifications.masterEnabled}
                                    onCheckedChange={(v) => updateSetting('notifications', 'masterEnabled', v)}
                                />
                            </div>
                            <Separator />
                            {[
                                { key: 'fireAlerts' as const, label: 'Fire Alerts' },
                                { key: 'motionAlerts' as const, label: 'Motion Alerts' },
                                { key: 'timerAlerts' as const, label: 'Timer Alerts' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                                    <Label className="font-medium">{item.label}</Label>
                                    <Switch
                                        checked={settings.notifications[item.key]}
                                        onCheckedChange={(v) => updateSetting('notifications', item.key, v)}
                                        disabled={!settings.notifications.masterEnabled}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Settings className="w-6 h-6 text-primary" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Settings</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar/Tabs */}
                    <aside className="w-full md:w-56 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-medium ${activeTab === tab.id
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">{renderTabContent()}</div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
