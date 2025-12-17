import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader2, Volume2, VolumeX, Volume1 } from 'lucide-react';
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
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 md:col-span-2 lg:col-span-2">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-lg">AI Smart Assistant 🤖</CardTitle>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        Ollama Powered AI
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        {speechVolume === 0 ? (
                            <VolumeX className="w-4 h-4 text-gray-400" />
                        ) : speechVolume < 0.5 ? (
                            <Volume1 className="w-4 h-4 text-gray-600" />
                        ) : (
                            <Volume2 className="w-4 h-4 text-purple-600" />
                        )}
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={speechVolume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto space-y-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-2 ${msg.isUser ? 'justify-end' : ''}`}>
                            {!msg.isUser && (
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`p-3 rounded-lg ${msg.isUser
                                    ? 'bg-blue-600 text-white max-w-[80%] shadow'
                                    : 'bg-white border max-w-[85%] shadow-sm'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                <p className="text-xs opacity-60 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                            </div>
                            {!msg.isUser && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                                    onClick={() => speakResponse(msg.message, speechVolume)}
                                    title="Read aloud"
                                >
                                    <Volume2 className="w-4 h-4 text-gray-500" />
                                </Button>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                            <div className="bg-white border p-3 rounded-lg">
                                <p className="text-sm text-gray-500">AI is thinking...</p>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder={UI_TEXT.CHATBOT_PLACEHOLDER}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isTyping}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isTyping || !newMessage.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                <div className="text-xs text-gray-500 bg-purple-50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">💡 Try these commands:</p>
                    <p>{UI_TEXT.CHATBOT_SUGGESTIONS}</p>
                    <p className="mt-1 text-purple-600">🔊 Voice responses enabled!</p>
                </div>
            </CardContent>
        </Card>
    );
};
