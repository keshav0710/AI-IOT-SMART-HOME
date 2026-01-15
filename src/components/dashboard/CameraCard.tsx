import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Video, ImageOff, AlertTriangle, Flame, Move, Clock, RefreshCw } from 'lucide-react';

interface CameraCardProps {
    // Future props when camera is integrated
    isConnected?: boolean;
    lastSnapshot?: string | null;
    lastSnapshotTime?: number | null;
    motionTriggered?: boolean;
    fireTriggered?: boolean;
}

export const CameraCard: React.FC<CameraCardProps> = ({
    isConnected = false,
    lastSnapshot = null,
    lastSnapshotTime = null,
    motionTriggered = false,
    fireTriggered = false,
}) => {
    return (
        <Card className="card-premium h-full overflow-hidden relative group">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-zinc-500/5 dark:from-slate-500/10 dark:to-zinc-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-500/10 to-zinc-500/10 dark:from-slate-500/20 dark:to-zinc-500/20 border border-slate-200/20">
                            <Camera className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Security Camera
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                {isConnected ? 'Connected' : 'Not Connected'}
                            </p>
                        </div>
                    </div>

                    {/* Status indicator */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isConnected
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                            : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                        {isConnected ? 'Live' : 'Offline'}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                {/* Camera Preview / Placeholder */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border/50">
                    {isConnected && lastSnapshot ? (
                        <img
                            src={lastSnapshot}
                            alt="Camera feed"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                {isConnected ? (
                                    <Video className="w-8 h-8" />
                                ) : (
                                    <ImageOff className="w-8 h-8" />
                                )}
                            </div>
                            <p className="text-sm font-medium">
                                {isConnected ? 'Camera Ready' : 'Camera Not Connected'}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                {isConnected ? 'Waiting for trigger event' : 'ESP32-CAM module required'}
                            </p>
                        </div>
                    )}

                    {/* Trigger indicators */}
                    {(motionTriggered || fireTriggered) && (
                        <div className="absolute top-2 left-2 flex gap-2">
                            {motionTriggered && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/90 text-white text-xs font-medium">
                                    <Move className="w-3 h-3" />
                                    Motion
                                </span>
                            )}
                            {fireTriggered && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/90 text-white text-xs font-medium animate-pulse">
                                    <Flame className="w-3 h-3" />
                                    Fire
                                </span>
                            )}
                        </div>
                    )}

                    {/* Timestamp */}
                    {lastSnapshotTime && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
                            <Clock className="w-3 h-3" />
                            {new Date(lastSnapshotTime).toLocaleTimeString()}
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9"
                        disabled={!isConnected}
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9"
                        disabled={!isConnected}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {/* Feature info */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-700 dark:text-amber-300">
                            <p className="font-medium">Future Feature</p>
                            <p className="mt-0.5 text-amber-600/80 dark:text-amber-400/80">
                                Camera integration requires ESP32-CAM module. Captures will be triggered by motion or fire detection.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
