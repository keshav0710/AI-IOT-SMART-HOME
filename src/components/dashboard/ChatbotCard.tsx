import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader2, Volume2, VolumeX, Volume1, Sparkles, Bot } from 'lucide-react';
import type { ChatMessage, SensorData, RelayStates } from '../../types/sensor.types';
import { speakResponse } from '../../chatbot';
import { UI_TEXT } from '../../utils/constants';

interface ChatbotCardProps {
    messages: ChatMessage[];
    isTyping: boolean;
    speechVolume: number;
    sensorData: SensorData;
    relayStates: RelayStates;
    onSendMessage: (message: string, systemState: { sensorData: SensorData; relayStates: RelayStates }) => void;
    onVolumeChange: (volume: number) => void;
}

export const ChatbotCard: React.FC<ChatbotCardProps> = ({
    messages,
    isTyping,
    speechVolume,
    sensorData,
    relayStates,
    onSendMessage,
    onVolumeChange,
}) => {
    const [newMessage, setNewMessage] = React.useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage, { sensorData, relayStates });
            setNewMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <Card className="card-premium md:col-span-2 lg:col-span-2 relative overflow-hidden group">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-3 relative z-10 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 border border-purple-200/20">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    AI Assistant
                                </CardTitle>
                                <span className="flex items-center px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-[10px] font-medium text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Ollama
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Always here to help</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-full border border-border/50">
                        <button
                            onClick={() => onVolumeChange(speechVolume === 0 ? 1 : 0)}
                            className="p-1.5 rounded-full hover:bg-background transition-colors"
                        >
                            {speechVolume === 0 ? (
                                <VolumeX className="w-4 h-4 text-muted-foreground" />
                            ) : speechVolume < 0.5 ? (
                                <Volume1 className="w-4 h-4 text-primary" />
                            ) : (
                                <Volume2 className="w-4 h-4 text-primary" />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={speechVolume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="w-20 h-1.5 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 relative z-10 flex flex-col h-[400px]">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                                <Bot className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Start chatting with your home assistant!</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            {!msg.isUser && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 mt-1">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}

                            <div className={`group relative max-w-[80%] ${msg.isUser ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative ${msg.isUser
                                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                                            : 'bg-muted/50 border border-border/50 text-foreground rounded-bl-sm dark:bg-muted/30'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                                <span className={`text-[10px] text-muted-foreground/60 mt-1 px-1 block ${msg.isUser ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>

                                {!msg.isUser && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 absolute -right-9 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => speakResponse(msg.message, speechVolume)}
                                        title="Read aloud"
                                    >
                                        <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>

                            {msg.isUser && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-xs font-bold text-muted-foreground">ME</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 mt-1">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                            <div className="bg-muted/50 border border-border/50 p-3.5 rounded-2xl rounded-bl-sm dark:bg-muted/30">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-muted/20 border-t border-border/50">
                    <div className="flex gap-2 relative">
                        <Input
                            placeholder={UI_TEXT.CHATBOT_PLACEHOLDER}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isTyping}
                            className="pr-12 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all rounded-xl h-11"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={isTyping || !newMessage.trim()}
                            className="absolute right-1 top-1 h-9 w-9 p-0 rounded-lg bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </Button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mr-1 py-1">Try:</span>
                        {UI_TEXT.CHATBOT_SUGGESTIONS.split(', ').slice(0, 3).map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => setNewMessage(suggestion)}
                                className="text-[10px] px-2 py-1 rounded-md bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
