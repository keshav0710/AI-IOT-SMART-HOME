import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Flame, User, AlertTriangle, CheckCircle2, PowerOff } from 'lucide-react';

interface SecurityCardProps {
    flameDetected: boolean;
    motionDetected: boolean;
    lastUpdated: number;
    flameSensorEnabled?: boolean;
    motionSensorEnabled?: boolean;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
    flameDetected,
    motionDetected,
    lastUpdated,
    flameSensorEnabled = true,
    motionSensorEnabled = true,
}) => {
    const hasSensorDisabled = !flameSensorEnabled || !motionSensorEnabled;

    return (
        <Card className="card-premium h-full overflow-hidden relative group">
            {/* Background Gradient Mesh */}
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${flameDetected && flameSensorEnabled ? 'from-red-500/10 to-orange-500/10' : 'from-green-500/5 to-emerald-500/5'
                }`} />

            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${flameDetected && flameSensorEnabled
                            ? 'bg-red-500/10 border-red-500/20 animate-pulse'
                            : 'bg-green-500/10 border-green-500/20'
                            }`}>
                            <Shield className={`w-5 h-5 ${flameDetected && flameSensorEnabled ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Security Hub
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Sensor Status</p>
                        </div>
                    </div>
                    {hasSensorDisabled && (
                        <span className="px-2 py-1 text-[10px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-full flex items-center gap-1">
                            <PowerOff className="w-3 h-3" /> Sensor Off
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3 relative z-10">
                {/* Fire Sensor Status */}
                <div className={`p-3.5 rounded-xl border transition-all duration-300 ${!flameSensorEnabled
                        ? 'bg-muted/20 border-border/30 opacity-50'
                        : flameDetected
                            ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                            : 'bg-muted/40 border-border/50'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${!flameSensorEnabled ? 'bg-muted' : flameDetected ? 'bg-red-500/20' : 'bg-muted'}`}>
                                <Flame className={`w-4 h-4 ${!flameSensorEnabled ? 'text-muted-foreground/50' : flameDetected ? 'text-red-500 animate-bounce' : 'text-muted-foreground'}`} />
                            </div>
                            <span className={`font-semibold text-sm ${!flameSensorEnabled ? 'text-muted-foreground/50' : ''}`}>Fire Sensor</span>
                        </div>
                        {!flameSensorEnabled ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">OFF</span>
                        ) : flameDetected && (
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 pl-9">
                        {!flameSensorEnabled ? (
                            <span className="text-xs font-medium text-muted-foreground/50">Sensor Disabled</span>
                        ) : flameDetected ? (
                            <>
                                <AlertTriangle className="w-3 H-3 text-red-500" />
                                <span className="text-xs font-medium text-red-500">CRITICAL ALERT: FIRE DETECTED</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                <span className="text-xs font-medium text-muted-foreground">Status: Normal</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Motion Sensor Status */}
                <div className={`p-3.5 rounded-xl border transition-all duration-300 ${!motionSensorEnabled
                        ? 'bg-muted/20 border-border/30 opacity-50'
                        : motionDetected
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-muted/40 border-border/50'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${!motionSensorEnabled ? 'bg-muted' : motionDetected ? 'bg-yellow-500/20' : 'bg-muted'}`}>
                                <User className={`w-4 h-4 ${!motionSensorEnabled ? 'text-muted-foreground/50' : motionDetected ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                            </div>
                            <span className={`font-semibold text-sm ${!motionSensorEnabled ? 'text-muted-foreground/50' : ''}`}>Motion Sensor</span>
                        </div>
                        {!motionSensorEnabled ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">OFF</span>
                        ) : motionDetected && (
                            <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 pl-9">
                        <span className={`text-xs font-medium ${!motionSensorEnabled
                                ? 'text-muted-foreground/50'
                                : motionDetected ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'
                            }`}>
                            {!motionSensorEnabled ? 'Sensor Disabled' : motionDetected ? 'Motion Detected' : 'No Motion'}
                        </span>
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <p className="text-[10px] text-muted-foreground/60 font-medium">
                        Last Update: {new Date(lastUpdated).toLocaleTimeString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
