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
        const className = `w-4 h-4 ${isOn ? 'text-yellow-500' : 'text-gray-400'}`;

        switch (relayKey) {
            case 'relay1':
            case 'relay2':
                return <Lightbulb className={className} />;
            case 'relay3':
                return <Fan className={isOn ? 'w-4 h-4 text-blue-500' : 'w-4 h-4 text-gray-400'} />;
            case 'relay4':
                return <Zap className={isOn ? 'w-4 h-4 text-blue-600' : 'w-4 h-4 text-gray-400'} />;
            default:
                return <Zap className={className} />;
        }
    };

    return (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">Appliances Control</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {(Object.keys(relayStates) as RelayKey[]).map((relayKey) => (
                        <div key={relayKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                {getIcon(relayKey, relayStates[relayKey])}
                                <span className="font-medium">{DEVICE_NAMES[relayKey]}</span>
                            </div>
                            <Switch
                                checked={relayStates[relayKey]}
                                onCheckedChange={() => onToggle(relayKey)}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
