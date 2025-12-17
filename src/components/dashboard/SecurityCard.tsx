import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Flame, User } from 'lucide-react';

interface SecurityCardProps {
    flameDetected: boolean;
    motionDetected: boolean;
    lastUpdated: number;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
    flameDetected,
    motionDetected,
    lastUpdated,
}) => {
    return (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-lg">Home Security</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Flame className={`w-4 h-4 ${flameDetected ? 'text-red-500' : 'text-green-500'}`} />
                            <span className="font-medium">Flame Sensor</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${flameDetected ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                                    }`}
                            ></div>
                            <span className={`text-sm font-medium ${flameDetected ? 'text-red-500' : 'text-green-500'}`}>
                                {flameDetected ? 'Fire!' : 'Safe'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <User className={`w-4 h-4 ${motionDetected ? 'text-yellow-500' : 'text-gray-400'}`} />
                            <span className="font-medium">Motion Sensor</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${motionDetected ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                                    }`}
                            ></div>
                            <span
                                className={`text-sm font-medium ${motionDetected ? 'text-yellow-500' : 'text-gray-400'}`}
                            >
                                {motionDetected ? 'Motion' : 'Clear'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <div
                        className={`p-3 rounded-lg border ${flameDetected ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                            }`}
                    >
                        <p className={`text-sm font-medium ${flameDetected ? 'text-red-600' : 'text-green-600'}`}>
                            Status: {flameDetected ? 'ALERT!' : 'All Clear'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Last: {new Date(lastUpdated).toLocaleTimeString()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
