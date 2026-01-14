import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group overflow-hidden"
            aria-label="Toggle theme"
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon container with rotation animation */}
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-500 ${theme === 'light'
                            ? 'rotate-0 opacity-100 scale-100'
                            : 'rotate-90 opacity-0 scale-0'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-500 ${theme === 'dark'
                            ? 'rotate-0 opacity-100 scale-100'
                            : '-rotate-90 opacity-0 scale-0'
                        }`}
                />
            </div>
        </button>
    );
}
