import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Volume2, VolumeX, Sparkles, Bot, Mic, MicOff, AlertCircle } from 'lucide-react';
import type { ChatMessage, SensorData, RelayStates } from '../../types/sensor.types';
import { speakResponse } from '../../chatbot';
import { useVoiceInput } from '../../hooks/useVoiceInput';

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
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const { isListening, transcript, error: voiceError, isSupported, startListening, stopListening, resetTranscript } = useVoiceInput();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (transcript) {
            setNewMessage(transcript);
        }
    }, [transcript]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage, { sensorData, relayStates });
            setNewMessage('');
            resetTranscript();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <Card className="card-premium relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-2 pt-3 px-3 relative z-10 border-b border-border/40">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 border border-purple-200/20 flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                                <CardTitle className="text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    AI Assistant
                                </CardTitle>
                                <span className="flex items-center px-1 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-[9px] font-medium text-purple-600 dark:text-purple-300">
                                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                    Ollama
                                </span>
                                {isSupported && (
                                    <span className="flex items-center px-1 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-[9px] font-medium text-green-600 dark:text-green-300">
                                        <Mic className="w-2.5 h-2.5" />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onVolumeChange(speechVolume === 0 ? 1 : 0)}
                        className="p-1.5 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                    >
                        {speechVolume === 0 ? (
                            <VolumeX className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-primary" />
                        )}
                    </button>
                </div>
            </CardHeader>

            <CardContent className="p-0 relative z-10 flex flex-col h-[320px]">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-60">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center mb-3">
                                <Bot className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">No messages yet</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                                {isSupported ? 'Type or use the mic!' : 'Start chatting!'}
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            {!msg.isUser && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-3 h-3 text-white" />
                                </div>
                            )}

                            <div className={`max-w-[85%] ${msg.isUser ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`p-2.5 rounded-xl text-xs leading-relaxed ${msg.isUser
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-muted/50 border border-border/50 text-foreground rounded-bl-sm dark:bg-muted/30'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                                <span className={`text-[9px] text-muted-foreground/60 mt-0.5 px-1 block ${msg.isUser ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {msg.isUser && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-[9px] font-bold text-muted-foreground">ME</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                <Loader2 className="w-3 h-3 text-white animate-spin" />
                            </div>
                            <div className="bg-muted/50 border border-border/50 p-2.5 rounded-xl rounded-bl-sm dark:bg-muted/30">
                                <div className="flex gap-1">
                                    <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Voice Error */}
                {voiceError && (
                    <div className="mx-3 mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <span className="text-[10px] text-red-600 dark:text-red-400">{voiceError}</span>
                    </div>
                )}

                {/* Listening Indicator */}
                {isListening && (
                    <div className="mx-3 mb-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                        <div className="relative">
                            <Mic className="w-3 h-3 text-green-500" />
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                        </div>
                        <span className="text-[10px] text-green-600 dark:text-green-400">Listening...</span>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-2 bg-muted/20 border-t border-border/50">
                    <div className="flex gap-1.5">
                        {isSupported && (
                            <Button
                                onClick={handleMicClick}
                                disabled={isTyping}
                                variant="ghost"
                                className={`h-8 w-8 p-0 rounded-lg flex-shrink-0 transition-all ${isListening
                                    ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
                                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            </Button>
                        )}

                        <div className="flex-1 relative">
                            <Input
                                placeholder={isListening ? "Listening..." : "Ask anything..."}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isTyping}
                                className={`pr-8 bg-background/50 border-border/50 focus-visible:ring-primary/20 rounded-lg h-8 text-xs ${isListening ? 'border-green-500/50 bg-green-500/5' : ''}`}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isTyping || !newMessage.trim()}
                                className="absolute right-0.5 top-0.5 h-7 w-7 p-0 rounded-md bg-primary hover:bg-primary/90"
                            >
                                <Send className="w-3 h-3 text-white" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1 justify-center">
                        {['Light on', 'Water?', 'Fan off 30m'].map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => setNewMessage(suggestion)}
                                className="text-[8px] px-1.5 py-0.5 rounded bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10"
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
