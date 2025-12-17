import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface DashboardHeaderProps {
    user: FirebaseUser | null;
    connectionStatus: string;
    onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    user,
    connectionStatus,
    onLogout,
}) => {
    return (
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-4 shadow-lg">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Home className="w-8 h-8" />
                            <h1 className="text-3xl font-bold">Smart Home AI Assistant</h1>
                        </div>
                        <p className="text-white/90 text-lg">Powered by Ollama AI 🤖</p>
                        <p className="text-white/70 text-sm">Status: {connectionStatus}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">Welcome, {user?.email}</span>
                        <Button
                            onClick={onLogout}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
