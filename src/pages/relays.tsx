import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
Home,
Droplets,
Zap,
Lightbulb,
Fan,
Smartphone,
Shield,
Flame,
User,
MessageCircle,
Mic,
MicOff,
Send,
AlertTriangle,
LogOut
} from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// 🔹 Firebase Imports
import { database, auth } from '../firebase';
import { ref, onValue, set, off } from 'firebase/database';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// 🔹 Import centralized chatbot logic
import { sendMessageToBot } from "../chatbot";

interface RelayStates {
relay1: boolean;
relay2: boolean;
relay3: boolean;
relay4: boolean;
}

interface ChatMessage {
id: string;
message: string;
isUser: boolean;
timestamp: number;
}

const RelaysPage: React.FC = () => {
const [relayStates, setRelayStates] = useState<RelayStates>({
relay1: false,
relay2: false,
relay3: false,
relay4: false
});

const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
{
id: '1',
message: "Hello! I'm your smart home assistant. Try 'turn on light 1' or 'check water level'. You can also use the microphone button to speak!",
isUser: false,
timestamp: Date.now()
}
]);

const [newMessage, setNewMessage] = useState<string>("");
const [loading, setLoading] = useState<boolean>(true);
const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
const [user, setUser] = useState<FirebaseUser | null>(null);

// 🎙 Speech Recognition Setup
const {
transcript,
listening,
resetTranscript,
browserSupportsSpeechRecognition
} = useSpeechRecognition();

const handleVoiceCommand = async (command: string) => {
await handleSendMessage(command);
};

// 🔹 Combined chatbot + smart home command handler
const handleSendMessage = async (message: string) => {
const userMessage: ChatMessage = {
id: Date.now().toString(),
message,
isUser: true,
timestamp: Date.now()
};
setChatMessages(prev => [...prev, userMessage]);


// 🔹 Call Hugging Face chatbot
const botReply = await sendMessageToBot(message);

const botMessage: ChatMessage = {
  id: (Date.now() + 1).toString(),
  message: botReply,
  isUser: false,
  timestamp: Date.now()
};
setChatMessages(prev => [...prev, botMessage]);


};

// 🎙 Handle Mic Button
const handleMicClick = () => {
if (!browserSupportsSpeechRecognition) {
alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
return;
}
if (listening) {
SpeechRecognition.stopListening();
if (transcript) {
setNewMessage(transcript);
resetTranscript();
}
} else {
SpeechRecognition.startListening({ continuous: false });
}
};

// 🧠 Auto-send after speaking
useEffect(() => {
if (!listening && transcript && transcript.length > 0) {
const timer = setTimeout(() => {
handleVoiceCommand(transcript);
resetTranscript();
setNewMessage('');
}, 1000);
return () => clearTimeout(timer);
}
}, [listening, transcript]);

// 🔹 Firebase Auth Initialization
useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
setUser(currentUser);
setLoading(false);
setConnectionStatus(currentUser ? "Connected" : "Not authenticated");
});
return unsubscribe;
}, []);

// ✉️ Handle manual send button
const handleSend = async () => {
if (newMessage.trim() === "") return;
await handleSendMessage(newMessage);
setNewMessage("");
};

return ( <div className="p-4 space-y-4"> <Card> <CardHeader> <CardTitle>Smart Home Relay Control</CardTitle> </CardHeader> <CardContent> <Alert> <AlertDescription>Status: {connectionStatus}</AlertDescription> </Alert>

      {/* Chat section */}
      <div className="chat-container mt-4 p-3 border rounded-lg h-[400px] overflow-y-auto bg-gray-50">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`my-2 ${msg.isUser ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Chat input + mic */}
      <div className="flex items-center mt-3 space-x-2">
        <Input
          type="text"
          placeholder="Type or speak your command..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={handleSend}>
          <Send className="w-4 h-4" />
        </Button>
        <Button onClick={handleMicClick}>
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      </div>
    </CardContent>
  </Card>
</div>


);
};

export default RelaysPage;
