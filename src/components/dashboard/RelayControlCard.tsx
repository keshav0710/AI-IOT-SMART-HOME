import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Smartphone, Lightbulb, Fan, Zap, Timer, X, Power, PowerOff, Clock
} from 'lucide-react';
import type { RelayStates, RelayKey } from '../../types/sensor.types';
import { DEVICE_NAMES } from '../../utils/constants';

interface RelayTimer {
    relayKey: RelayKey;
    endTime: number;
    duration: number;
    action: 'on' | 'off';
    createdAt: number;
}

interface ActiveTimers {
    relay1?: RelayTimer;
    relay2?: RelayTimer;
    relay3?: RelayTimer;
    relay4?: RelayTimer;
}

interface RelayControlCardProps {
    relayStates: RelayStates;
    onToggle: (relayKey: RelayKey) => void;
    activeTimers?: ActiveTimers;
    remainingTimes?: Record<RelayKey, number>;
    onSetTimer?: (relayKey: RelayKey, hours: number, minutes: number, seconds: number, action: 'on' | 'off') => void;
    onCancelTimer?: (relayKey: RelayKey) => void;
    onAllOn?: () => void;
    onAllOff?: () => void;
}

const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const RelayControlCard: React.FC<RelayControlCardProps> = ({
    relayStates,
    onToggle,
    activeTimers = {},
    remainingTimes = { relay1: 0, relay2: 0, relay3: 0, relay4: 0 },
    onSetTimer,
    onCancelTimer,
    onAllOn,
    onAllOff,
}) => {
    const [timerModal, setTimerModal] = useState<{
        open: boolean;
        relayKey: RelayKey | null;
        action: 'on' | 'off';
    }>({ open: false, relayKey: null, action: 'off' });
    const [timerInput, setTimerInput] = useState({ hours: 0, minutes: 0, seconds: 0 });

    const getIcon = (relayKey: RelayKey, isOn: boolean) => {
        const baseClass = "w-5 h-5 transition-all duration-300";

        switch (relayKey) {
            case 'relay1':
            case 'relay2':
                return <Lightbulb className={`${baseClass} ${isOn ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-muted-foreground'}`} />;
            case 'relay3':
                return <Fan className={`${baseClass} ${isOn ? 'text-blue-400 animate-spin-slow drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-muted-foreground'}`} />;
            case 'relay4':
                return <Zap className={`${baseClass} ${isOn ? 'text-purple-400 fill-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]' : 'text-muted-foreground'}`} />;
            default:
                return <Zap className={`${baseClass} ${isOn ? 'text-primary' : 'text-muted-foreground'}`} />;
        }
    };

    const handleOpenTimer = (relayKey: RelayKey, action: 'on' | 'off') => {
        setTimerModal({ open: true, relayKey, action });
        setTimerInput({ hours: 0, minutes: 0, seconds: 0 });
    };

    const handleSetTimer = () => {
        if (timerModal.relayKey && onSetTimer) {
            const { hours, minutes, seconds } = timerInput;
            if (hours > 0 || minutes > 0 || seconds > 0) {
                onSetTimer(timerModal.relayKey, hours, minutes, seconds, timerModal.action);
                setTimerModal({ open: false, relayKey: null, action: 'off' });
            }
        }
    };

    const hasActiveTimer = (relayKey: RelayKey) => {
        return remainingTimes[relayKey] > 0;
    };

    return (
        <Card className="card-premium h-full overflow-hidden relative group">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200/20">
                            <Smartphone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Smart Controls
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your appliances</p>
                        </div>
                    </div>

                    {/* All ON/OFF Buttons */}
                    {(onAllOn || onAllOff) && (
                        <div className="flex gap-1.5">
                            {onAllOn && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onAllOn}
                                    className="h-8 px-2 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20"
                                >
                                    <Power className="w-3.5 h-3.5 mr-1" />
                                    All ON
                                </Button>
                            )}
                            {onAllOff && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onAllOff}
                                    className="h-8 px-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20"
                                >
                                    <PowerOff className="w-3.5 h-3.5 mr-1" />
                                    All OFF
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
                {(Object.keys(relayStates) as RelayKey[]).map((relayKey, index) => (
                    <div
                        key={relayKey}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/30 border border-border/50 hover:border-primary/20 transition-all duration-300 group/item"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg transition-colors duration-300 flex-shrink-0 ${relayStates[relayKey] ? 'bg-background shadow-sm' : 'bg-transparent'}`}>
                                {getIcon(relayKey, relayStates[relayKey])}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className={`font-semibold text-sm transition-colors duration-300 truncate ${relayStates[relayKey] ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {DEVICE_NAMES[relayKey]}
                                </span>

                                {/* Timer countdown display */}
                                {hasActiveTimer(relayKey) ? (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Clock className="w-3 h-3 text-orange-500 animate-pulse flex-shrink-0" />
                                        <span className="text-[10px] font-mono text-orange-500 font-semibold">
                                            {formatTime(remainingTimes[relayKey])}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">
                                            → {activeTimers[relayKey]?.action === 'on' ? 'ON' : 'OFF'}
                                        </span>
                                        {onCancelTimer && (
                                            <button
                                                onClick={() => onCancelTimer(relayKey)}
                                                className="ml-1 p-0.5 rounded hover:bg-red-500/20 text-red-500 flex-shrink-0"
                                                title="Cancel timer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground/70 capitalize">
                                        {relayStates[relayKey] ? 'Active' : 'Off'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Timer button */}
                            {onSetTimer && !hasActiveTimer(relayKey) && (
                                <button
                                    onClick={() => handleOpenTimer(relayKey, relayStates[relayKey] ? 'off' : 'on')}
                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                    title="Set timer"
                                >
                                    <Timer className="w-4 h-4" />
                                </button>
                            )}

                            <Switch
                                checked={relayStates[relayKey]}
                                onCheckedChange={() => onToggle(relayKey)}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent"
                            />
                        </div>
                    </div>
                ))}

                {/* Timer Modal */}
                {timerModal.open && timerModal.relayKey && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setTimerModal({ open: false, relayKey: null, action: 'off' })}>
                        <div
                            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-lg">Set Timer</h3>
                                </div>
                                <button
                                    onClick={() => setTimerModal({ open: false, relayKey: null, action: 'off' })}
                                    className="p-1 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">
                                Turn <span className="font-semibold text-foreground">{DEVICE_NAMES[timerModal.relayKey]}</span> {timerModal.action === 'on' ? 'ON' : 'OFF'} after:
                            </p>

                            {/* HH:MM:SS Input */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <div className="text-center">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={timerInput.hours}
                                        onChange={(e) => setTimerInput({ ...timerInput, hours: Math.max(0, parseInt(e.target.value) || 0) })}
                                        className="w-16 text-center text-xl font-mono font-bold"
                                    />
                                    <span className="text-xs text-muted-foreground">Hours</span>
                                </div>
                                <span className="text-2xl font-bold text-muted-foreground pb-5">:</span>
                                <div className="text-center">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={timerInput.minutes}
                                        onChange={(e) => setTimerInput({ ...timerInput, minutes: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
                                        className="w-16 text-center text-xl font-mono font-bold"
                                    />
                                    <span className="text-xs text-muted-foreground">Minutes</span>
                                </div>
                                <span className="text-2xl font-bold text-muted-foreground pb-5">:</span>
                                <div className="text-center">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={timerInput.seconds}
                                        onChange={(e) => setTimerInput({ ...timerInput, seconds: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
                                        className="w-16 text-center text-xl font-mono font-bold"
                                    />
                                    <span className="text-xs text-muted-foreground">Seconds</span>
                                </div>
                            </div>

                            {/* Quick presets */}
                            <div className="flex flex-wrap gap-2 mb-6 justify-center">
                                {[
                                    { label: '5m', h: 0, m: 5, s: 0 },
                                    { label: '15m', h: 0, m: 15, s: 0 },
                                    { label: '30m', h: 0, m: 30, s: 0 },
                                    { label: '1h', h: 1, m: 0, s: 0 },
                                    { label: '2h', h: 2, m: 0, s: 0 },
                                    { label: '4h', h: 4, m: 0, s: 0 },
                                ].map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => setTimerInput({ hours: preset.h, minutes: preset.m, seconds: preset.s })}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setTimerModal({ open: false, relayKey: null, action: 'off' })}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-to-r from-primary to-purple-600"
                                    onClick={handleSetTimer}
                                    disabled={timerInput.hours === 0 && timerInput.minutes === 0 && timerInput.seconds === 0}
                                >
                                    <Timer className="w-4 h-4 mr-2" />
                                    Set Timer
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
