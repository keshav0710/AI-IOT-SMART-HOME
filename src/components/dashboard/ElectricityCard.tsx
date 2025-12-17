import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface ElectricityCardProps {
    voltage: number;
    current: number;
    power: number;
}

export const ElectricityCard: React.FC<ElectricityCardProps> = ({ voltage, current, power }) => {
    return (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="text-lg">Electricity Usage</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Voltage</span>
                        <span className="text-lg font-bold text-yellow-600">{voltage.toFixed(1)}V</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Current</span>
                        <span className="text-lg font-bold text-yellow-600">{current.toFixed(1)}A</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Power</span>
                        <span className="text-lg font-bold text-yellow-600">{power.toFixed(1)}W</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
