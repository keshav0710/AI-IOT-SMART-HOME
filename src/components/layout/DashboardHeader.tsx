import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Settings, Wifi, WifiOff } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Home className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                Smart Home AI
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {connectionStatus === 'connected' ? 'System Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                            <span className="text-xs text-muted-foreground">Admin Access</span>
                        </div>

                        <Button
                            onClick={() => navigate('/settings')}
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-primary/10 transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </Button>

                        <ThemeToggle />

                        <Button
                            onClick={onLogout}
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
