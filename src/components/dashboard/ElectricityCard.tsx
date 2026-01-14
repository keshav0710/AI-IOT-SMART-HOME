import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Activity, Gauge, IndianRupee, TrendingUp, Clock } from 'lucide-react';

interface ElectricityCardProps {
    voltage: number;
    current: number;
    power: number;
    totalEnergyKwh?: number; // Actual accumulated energy from ESP32
    unitPrice?: number; // ₹ per kWh
}

export const ElectricityCard: React.FC<ElectricityCardProps> = ({
    voltage,
    current,
    power,
    totalEnergyKwh,
    unitPrice = 8.5
}) => {
    // Check if we have actual energy data from ESP32
    const hasActualEnergy = totalEnergyKwh !== undefined && totalEnergyKwh > 0;

    // Estimated monthly consumption (when no actual data)
    const hourlyKwh = power / 1000;
    const estimatedMonthlyKwh = hourlyKwh * 24 * 30;

    // Use actual or estimated energy
    const displayEnergy = hasActualEnergy ? totalEnergyKwh : estimatedMonthlyKwh;
    const energyCost = displayEnergy * unitPrice;

    return (
        <Card className="card-premium h-full overflow-hidden relative group">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 dark:from-yellow-500/10 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/20 dark:to-orange-500/20 border border-yellow-200/20">
                            <Zap className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Power & Energy
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Real-time Monitoring</p>
                        </div>
                    </div>
                    {hasActualEnergy && (
                        <span className="px-2 py-1 text-[10px] font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full">
                            LIVE
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
                {/* Main Power Display */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 relative overflow-hidden group/stat">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/stat:opacity-20 transition-opacity">
                        <Zap className="w-12 h-12" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Current Power</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-yellow-500 drop-shadow-sm">{power.toFixed(1)}</span>
                        <span className="text-sm font-semibold text-muted-foreground">W</span>
                    </div>
                </div>

                {/* Energy & Cost Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br border ${hasActualEnergy ? 'from-green-500/10 to-transparent border-green-500/20' : 'from-blue-500/10 to-transparent border-blue-500/20'}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            {hasActualEnergy ? (
                                <Clock className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                {hasActualEnergy ? 'Total Used' : 'Est. Monthly'}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-bold ${hasActualEnergy ? 'text-green-500' : 'text-blue-500'}`}>
                                {displayEnergy.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">kWh</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <IndianRupee className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                {hasActualEnergy ? 'Total Cost' : 'Est. Cost'}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-purple-500">₹{energyCost.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {/* Voltage & Current Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors group/mini">
                        <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                            <Activity className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-medium">Voltage</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-foreground group-hover/mini:text-blue-500 transition-colors">
                                {voltage.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">V</span>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors group/mini">
                        <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
                            <Gauge className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs font-medium">Current</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-foreground group-hover/mini:text-orange-500 transition-colors">
                                {current.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">A</span>
                        </div>
                    </div>
                </div>

                {/* Rate Info */}
                <div className="text-[10px] text-muted-foreground/60 text-right">
                    Rate: ₹{unitPrice}/kWh {!hasActualEnergy && '• Estimated values'}
                </div>
            </CardContent>
        </Card>
    );
};
