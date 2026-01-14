# AI IoT Smart Home System

A comprehensive Smart Home Automation system built with IoT hardware, web technologies, and AI integration. Control and monitor your home devices in real-time through an intelligent web dashboard.

---

## 🎯 Project Overview

This college project demonstrates a complete IoT ecosystem featuring:
- **Real-time device control** via web dashboard
- **Sensor monitoring** with instant alerts
- **AI-powered chatbot** for natural language control
- **Voice commands** for hands-free operation
- **Smart automation** based on sensor triggers
- **Energy monitoring** and cost tracking
- **Scheduling** and scene management

---

## ✨ Core Features

### 🔔 Smart Notifications (FCM)
- Push notifications to Android/iOS devices
- Fire detection instant alerts
- Motion detection notifications
- Timer completion alerts
- Background notification support

### 🔥 Fire Detection System
- Real-time fire sensor monitoring
- Instant push notifications
- Visual dashboard alerts
- Buzzer/alarm triggers
- Emergency response ready

### 🚶 Motion-Based Automation
- Auto lights ON when motion detected
- Configurable auto-off timer
- Enable/disable motion mode
- Motion event notifications
- Smart lighting control

### ⚡ Relay Control & Timers
- Individual relay ON/OFF control
- "All Lights" master switch
- Duration-based timers (e.g., "4 hours")
- Timer status display
- Auto shutoff on completion
- Cancel active timers

### 🎤 Voice Control
- Web Speech API integration
- Voice-to-text conversion
- Natural language commands
- Microphone button in chatbot
- Visual listening indicator
- Multi-language support (English/Hindi)

### 💬 AI Chatbot
- Natural language processing
- Device control via text/voice
- Timer management commands
- System status queries
- Ollama LLM integration
- Context-aware responses

### 📊 Energy Monitoring
- Track relay power consumption
- Set electricity cost (₹/kWh)
- Calculate usage costs
- Energy usage dashboard
- Cost estimation

### ⏰ Scheduling & Automation
- Schedule relay ON/OFF by time
- Daily/weekly recurring schedules
- Conditional automation rules
- Holiday mode toggle
- Disable automations when away

### 🎬 Scene Management
- Create custom scenes
- Control multiple devices at once
- One-tap scene activation
- Quick-access scene buttons
- Save favorite configurations

### 🌡️ Weather Integration
- Local weather display
- Weather-based automation
- Temperature-triggered actions
- Weather data on dashboard

### 📈 Usage Analytics
- Device usage statistics
- Frequently used devices
- Peak usage times
- Usage patterns insights

### 🌙 Dark Mode
- Manual theme toggle
- System theme detection
- Dark mode across all UI
- Eye-friendly interface

### 🎛️ Dashboard Customization
- Quick toggle widgets
- Compact/expanded views
- Customizable layout
- Responsive design

### 📡 Device Health Monitoring
- Online/offline status
- Connectivity checks
- Offline device alerts
- Connection quality metrics

### 📷 Camera Support (Future-Ready)
- Camera device schema ready
- UI placeholders prepared
- Motion-triggered capture design
- Fire snapshot architecture

---

## 🛠️ Tech Stack

### Frontend
- **React** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **shadcn-ui** (component library)
- **Lucide React** (icons)
- **React Query** (data fetching)

### Backend & Services
- **Firebase Authentication**
- **Firebase Realtime Database**
- **Firebase Cloud Firestore**
- **Firebase Cloud Functions**
- **Firebase Cloud Messaging (FCM)**

### AI & Voice
- **Ollama** (LLM for chatbot)
- **Web Speech API** (voice recognition)
- **Natural Language Processing**

### Hardware
- **ESP32** microcontroller
- **PIR Motion Sensor**
- **Flame Sensor**
- **Ultrasonic Sensor** (water level)
- **Relay Modules** (4-channel)
- **Current/Voltage Sensors**

---

## 📁 Project Structure

```
IOT NEW/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── ChatbotCard.tsx
│   │   │   ├── RelayControlCard.tsx
│   │   │   ├── SecurityCard.tsx
│   │   │   ├── WaterTankCard.tsx
│   │   │   └── ElectricityCard.tsx
│   │   ├── ui/                 # shadcn-ui components
│   │   └── layout/             # Layout components
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSensorData.ts
│   │   ├── useChatbot.ts
│   │   ├── useFireAlerts.ts
│   │   ├── useMotionAutomation.ts
│   │   └── useRelayTimers.ts
│   ├── services/
│   │   ├── firebase/
│   │   │   ├── database.service.ts
│   │   │   ├── automation.service.ts
│   │   │   └── timer.service.ts
│   │   ├── fcm.service.ts
│   │   └── notification.service.ts
│   ├── types/
│   │   ├── sensor.types.ts
│   │   └── timer.types.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── SettingsPage.tsx
│   ├── chatbot.tsx             # AI chatbot logic
│   ├── firebase.js             # Firebase config
│   └── App.tsx
├── public/
│   └── firebase-messaging-sw.js # FCM service worker
├── functions/                   # Cloud Functions
│   └── src/
│       └── index.ts
├── .env                         # Environment variables
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account (Blaze plan for Cloud Functions)
- ESP32 with sensors setup
- Ollama installed (for chatbot)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "IOT NEW"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key
   VITE_OLLAMA_URL=http://localhost:11434
   ```

4. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication, Realtime Database, Firestore, and FCM
   - Generate VAPID keys for web push
   - Download service account key for Cloud Functions

5. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Start Ollama (for chatbot)**
   ```bash
   ollama serve
   ollama pull phi3
   ```

---

## 📱 Firebase Database Structure

### Realtime Database
```json
{
  "sensors": {
    "flame": true/false,
    "motion": true/false,
    "waterLevel": 0-100,
    "voltage": number,
    "current": number,
    "power": number
  },
  "relays": {
    "relay1": true/false,
    "relay2": true/false,
    "relay3": true/false,
    "relay4": true/false
  },
  "automation": {
    "motionDetection": {
      "enabled": true/false,
      "timeout": 300000
    }
  }
}
```

### Firestore Collections
```
users/{userId}
  - email, displayName
  - notificationPreferences
  - energySettings

fcmTokens/{userId}/tokens/{tokenId}
  - token, deviceType, createdAt

timers/{userId}/{timerId}
  - relayKey, duration, endTime, active

scenes/{userId}/{sceneId}
  - name, relays, createdAt

schedules/{userId}/{scheduleId}
  - relayKey, time, recurring, enabled

notificationLogs/{logId}
  - userId, type, message, timestamp
```

---

## 🎮 Usage

### Web Dashboard
1. Login with Firebase Authentication
2. View real-time sensor data
3. Control relays individually or all at once
4. Set timers for automatic shutoff
5. Create scenes for quick control
6. Schedule automation rules
7. Monitor energy consumption

### Voice Commands
- "Turn on light 1"
- "Turn off all lights"
- "Set timer for light 2 for 4 hours"
- "What's the water level?"
- "Show me the power consumption"
- "Cancel timer for fan"

### Chatbot Commands
- Device control: "turn on/off [device]"
- Timer management: "set timer for [device] [duration]"
- Status queries: "water level", "is motion detected?"
- Scene activation: "activate movie mode"

---

## 🔐 Security Features

- Firebase Authentication (email/password)
- Environment variable protection
- Secure FCM token management
- Cloud Functions for server-side logic
- HTTPS-only communication
- Service worker for secure notifications

---

## 📊 Monitoring & Analytics

- Real-time device status
- Energy consumption tracking
- Usage pattern analysis
- Cost estimation
- Device health monitoring
- Notification history

---

## 🎯 Future Enhancements

- ESP32-CAM integration for live feed
- Multi-user access with permissions
- Geofencing automation
- Google Assistant/Alexa integration
- Mobile app (React Native)
- Advanced ML-based predictions

---

## 🤝 Contributing

This is a college project, but suggestions and improvements are welcome!

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

Developed as a college project demonstrating IoT, web development, and AI integration skills.

> **Note**: The initial frontend structure was scaffolded using Lovable to speed up UI setup. All core logic, integrations, and project architecture are designed and implemented by me.

---

## 🙏 Acknowledgments

- Firebase for backend services
- Ollama for AI capabilities
- shadcn-ui for beautiful components
- Lovable for initial UI scaffolding
- ESP32 community for hardware support

---

## 📞 Support

For questions or issues, please refer to the implementation plan and task documentation in the `brain/` directory.
