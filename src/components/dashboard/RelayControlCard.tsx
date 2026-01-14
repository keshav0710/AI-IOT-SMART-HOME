import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Lightbulb, Fan, Zap } from 'lucide-react';
import type { RelayStates, RelayKey } from '../../types/sensor.types';
import { DEVICE_NAMES } from '../../utils/constants';

interface RelayControlCardProps {
    relayStates: RelayStates;
    onToggle: (relayKey: RelayKey) => void;
}

export const RelayControlCard: React.FC<RelayControlCardProps> = ({ relayStates, onToggle }) => {
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

    return (
        <Card className="card-premium h-full overflow-hidden relative group">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-4 relative z-10">
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
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
                {(Object.keys(relayStates) as RelayKey[]).map((relayKey, index) => (
                    <div
                        key={relayKey}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/60 dark:bg-muted/20 dark:hover:bg-muted/30 border border-border/50 hover:border-primary/20 transition-all duration-300 group/item"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${relayStates[relayKey] ? 'bg-background shadow-sm' : 'bg-transparent'}`}>
                                {getIcon(relayKey, relayStates[relayKey])}
                            </div>
                            <div className="flex flex-col">
                                <span className={`font-semibold text-sm transition-colors duration-300 ${relayStates[relayKey] ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {DEVICE_NAMES[relayKey]}
                                </span>
                                <span className="text-[10px] text-muted-foreground/70 capitalize">
                                    {relayStates[relayKey] ? 'Active' : 'Off'}
                                </span>
                            </div>
                        </div>
                        <Switch
                            checked={relayStates[relayKey]}
                            onCheckedChange={() => onToggle(relayKey)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-accent"
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
