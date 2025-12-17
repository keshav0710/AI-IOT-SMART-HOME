import { useState, useCallback } from 'react';
import { sendMessageToBot } from '../chatbot';
import type { ChatMessage, SensorData, RelayStates } from '../types/sensor.types';
import { UI_TEXT } from '../utils/constants';

interface UseChatbotReturn {
    messages: ChatMessage[];
    isTyping: boolean;
    sendMessage: (message: string, systemState?: { sensorData: SensorData; relayStates: RelayStates }) => Promise<void>;
    clearMessages: () => void;
}

/**
 * Custom hook for chatbot functionality with context-aware LLM
 */
export function useChatbot(userId: string | null): UseChatbotReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            message: UI_TEXT.WELCOME_MESSAGE,
            isUser: false,
            timestamp: Date.now(),
        },
    ]);

    const [isTyping, setIsTyping] = useState<boolean>(false);

    const sendMessage = useCallback(
        async (message: string, systemState?: { sensorData: SensorData; relayStates: RelayStates }): Promise<void> => {
            if (!message.trim() || !userId) return;

            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                message,
                isUser: true,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsTyping(true);

            try {
                // Pass system state to chatbot for context-aware responses
                const botResponse = await sendMessageToBot(message, userId, systemState);

                const botMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    message: botResponse,
                    isUser: false,
                    timestamp: Date.now(),
                };

                setMessages((prev) => [...prev, botMessage]);
            } catch (error) {
                console.error('Error processing message:', error);
                const errorMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    message: 'Sorry, I encountered an error. Please try again.',
                    isUser: false,
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsTyping(false);
            }
        },
        [userId]
    );

    const clearMessages = useCallback(() => {
        setMessages([
            {
                id: '1',
                message: UI_TEXT.WELCOME_MESSAGE,
                isUser: false,
                timestamp: Date.now(),
            },
        ]);
    }, []);

    return { messages, isTyping, sendMessage, clearMessages };
}

