# 🏠 Smart Home Automation Platform

> A full-stack IoT system built with **ESP32**, **Firebase Realtime Database**, **React + TypeScript**, and a **local AI assistant (Ollama)** for real-time device monitoring, control, and natural language automation.

---

## 📸 Overview

This project is a complete smart home solution that bridges physical hardware (ESP32 microcontroller + sensors) with a modern web dashboard. Users can monitor live sensor data, control appliances remotely, set automation timers, and interact with an AI chatbot — all in real-time.

---

## ✨ Features

### 🔌 Hardware Integration
- **4 Relay Outputs** — Control 2 lights, 1 fan, and 1 extra appliance
- **PIR Motion Sensor** — Detects movement and triggers automation
- **HC-SR04 Ultrasonic Sensor** — Measures water tank level via distance
- **Flame Sensor** — Fire detection with buzzer alert
- **ZMPT101B Voltage Sensor** — Measures AC mains voltage (RMS)
- **ACS712 30A Current Sensor** — Measures AC current draw (RMS)
- **EEPROM Persistence** — Energy data survives ESP32 reboots

### 📊 Real-Time Dashboard
- Live sensor data updates via Firebase WebSocket listeners
- Water tank level with visual fill indicator and overflow/empty alerts
- Electricity monitoring: Voltage, Current, Power (W), Energy (kWh), Cost (₹)
- Security panel: Motion and flame detection status
- Device control panel with individual toggle switches
- Timer automation: Set countdown timers per device (5m, 15m, 30m, 1h, 2h, 4h presets)
- One-click "All ON / All OFF" bulk control
- Authentication (Firebase Auth — email/password)

### 🤖 AI Chatbot + Voice Assistant
- Local LLM via **Ollama** (Phi-3 model) — no internet or API keys required
- Natural language device control: *"Turn on fan for 2 hours"*, *"Light 1 off"*
- Bilingual support: English + Hindi (Hinglish) — *"pankha band karo"*, *"light chalu"*
- Context-aware responses with live sensor data injected into LLM prompt
- **Voice input** via Web Speech Recognition API
- **Voice output** via Web Speech Synthesis API
- Timer management via chat: set, check, and cancel device timers

### ⚙️ Automation
- **Motion-triggered lighting** — Auto turn on lights when motion detected
- **Auto-off timeout** — Lights auto-off after configurable minutes (default: 5 min)
- **Holiday Mode** — Suppresses motion automation when away
- **Timer-based scheduling** — Per-device countdown timers synced through Firebase
- **Fire alert** — Buzzer activates on flame detection; dashboard shows critical alert

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Microcontroller** | ESP32 (Arduino C++) |
| **Sensors** | PIR, HC-SR04, Flame, ZMPT101B, ACS712 |
| **Database** | Firebase Realtime Database |
| **Authentication** | Firebase Auth |
| **Frontend** | React 18 + TypeScript + Vite |
| **UI Components** | shadcn/ui + Radix UI + Tailwind CSS |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **AI Model** | Ollama (Phi-3 — runs locally) |
| **AI Proxy Server** | Python Flask + flask-cors |
| **Voice Input** | Web Speech Recognition API |
| **Voice Output** | Web Speech Synthesis API |
| **Deployment** | Vercel (frontend) + Firebase (backend) |

---

## 🗂️ Project Structure

```
IOT NEW/
├── esp32_energy_code.ino       # ESP32 firmware (Arduino C++)
├── ollama_server.py            # Python Flask proxy for Ollama AI
├── .env.example                # Environment variable template
├── package.json                # Node dependencies
├── vite.config.ts              # Vite build config
└── src/
    ├── firebase.js             # Firebase initialization
    ├── chatbot.tsx             # Chatbot engine + command handler
    ├── App.tsx                 # App entry + routing
    ├── components/
    │   ├── dashboard/
    │   │   ├── WaterTankCard.tsx       # Water level UI
    │   │   ├── ElectricityCard.tsx     # Power monitoring UI
    │   │   ├── RelayControlCard.tsx    # Device toggles + timers
    │   │   ├── SecurityCard.tsx        # Motion + flame status
    │   │   ├── CameraCard.tsx          # Camera feed placeholder
    │   │   └── ChatbotCard.tsx         # AI chat UI + mic button
    │   └── layout/
    │       ├── DashboardHeader.tsx
    │       └── DashboardAlerts.tsx
    ├── pages/
    │   ├── Dashboard.tsx       # Main dashboard page
    │   ├── Login.tsx           # Login page
    │   ├── SettingsPage.tsx    # Settings (sensors, automation, energy)
    │   └── relays.tsx          # Relay management page
    ├── hooks/
    │   ├── useSensorData.ts        # Firebase real-time sensor listener
    │   ├── useRelayControl.ts      # Relay toggle logic
    │   ├── useRelayTimers.ts       # Timer state + countdown
    │   ├── useMotionAutomation.ts  # Motion-triggered automation
    │   ├── useChatbot.ts           # Chatbot state management
    │   ├── useVoiceInput.ts        # Web Speech API hook
    │   ├── useAuth.ts              # Firebase auth hook
    │   ├── useSettings.ts          # User settings hook
    │   └── useWeather.ts           # Weather API hook
    ├── services/
    │   └── firebase/
    │       ├── database.service.ts  # Sensor read + real-time listeners
    │       └── relay.service.ts     # Relay write operations
    ├── utils/
    │   ├── water-tank.utils.ts      # Water level calculation helpers
    │   └── constants.ts             # Firebase paths, device names
    └── types/
        └── sensor.types.ts          # TypeScript interfaces
```

---

## ⚡ Firebase Realtime Database Structure

```json
{
  "sensors": {
    "voltage": 230.5,
    "current": 1.2,
    "power": 276.6,
    "totalEnergyKwh": 0.0234,
    "distance": 18.3,
    "motion": 0,
    "flame": 0,
    "timestamp": 1710000000
  },
  "relays": {
    "relay1": false,
    "relay2": false,
    "relay3": true,
    "relay4": false
  },
  "timers": {
    "relay1": {
      "relayKey": "relay1",
      "endTime": 1710003600000,
      "duration": 3600,
      "action": "off",
      "createdAt": 1710000000000
    }
  },
  "commands": {
    "resetEnergy": 0
  }
}
```

> **Note:** Relays use active-low logic. `false` in Firebase = relay physically ON. The frontend inverts this transparently.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- [Ollama](https://ollama.ai/) installed locally
- Firebase project with Realtime Database enabled
- Arduino IDE with ESP32 board support

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-home-iot.git
cd smart-home-iot
```

---

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OLLAMA_URL=http://localhost:5001/ollama
VITE_OLLAMA_CHAT_URL=http://localhost:5001/ollama/chat
```

---

### 3. Install Frontend Dependencies

```bash
npm install
npm run dev
```

Dashboard will start at `http://localhost:5173`

---

### 4. Start the AI Proxy Server

```bash
# Install Python dependencies
pip install flask flask-cors requests

# Pull the AI model (first time only)
ollama pull phi3

# Start Ollama
ollama serve

# In a new terminal, start the proxy
python ollama_server.py
```

Proxy server runs at `http://localhost:5001`

---

### 5. Flash ESP32 Firmware

1. Open `esp32_energy_code.ino` in Arduino IDE
2. Install required library: **Firebase ESP Client** by Mobizt
3. Update WiFi credentials in the file:
   ```cpp
   char ssid[] = "YOUR_WIFI_SSID";
   char pass[] = "YOUR_WIFI_PASSWORD";
   ```
4. Update Firebase credentials:
   ```cpp
   #define API_KEY "your_firebase_api_key"
   #define DATABASE_URL "https://your-project-rtdb.firebaseio.com"
   ```
5. Select **ESP32 Dev Module** board, choose the correct COM port
6. Upload the sketch

---

## 🔌 ESP32 Pin Configuration

| Component | GPIO Pin |
|---|---|
| Ultrasonic TRIG | GPIO 5 |
| Ultrasonic ECHO | GPIO 18 |
| PIR Sensor | GPIO 21 |
| Flame Sensor | GPIO 19 |
| LED 1 | GPIO 25 |
| LED 2 | GPIO 26 |
| Buzzer | GPIO 27 |
| Relay 1 (Light 1) | GPIO 23 |
| Relay 2 (Light 2) | GPIO 22 |
| Relay 3 (Fan) | GPIO 13 |
| Relay 4 (Extra) | GPIO 12 |
| Voltage Sensor | A0 (GPIO 36) |
| Current Sensor | A3 (GPIO 39) |

> **Important:** Voltage (GPIO 36) and Current (GPIO 39) sensors use ADC1 pins — safe to use with WiFi active. Never use ADC2 pins with WiFi enabled.

---

## 🤖 AI Chatbot — Example Commands

| Command | Action |
|---|---|
| `"Turn on light 1"` | Relay 1 ON |
| `"Fan off"` / `"pankha band"` | Relay 3 OFF |
| `"Turn on fan for 2 hours"` | Relay 3 ON, timer set for 2 hrs |
| `"Light off after 30 minutes"` | Sets timer to turn off relay 1 |
| `"Sab band karo"` | Turn off ALL devices |
| `"Check water level"` / `"pani kitna hai"` | Returns water tank status |
| `"What is my electricity bill?"` | Returns kWh + ₹ cost estimate |
| `"Status"` | Full sensor system report |
| `"Timer status"` | Shows all active countdowns |
| `"Cancel light 1 timer"` | Cancels the relay 1 countdown |

---

## 🌐 Deployment (Vercel)

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

Set all `VITE_FIREBASE_*` environment variables in your Vercel project settings.

> The AI proxy (`ollama_server.py`) runs locally and is **not** deployed to Vercel — it requires Ollama running on the same machine.

---

## 🔐 Firebase Security Rules (Recommended)

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

---

## 📦 Key Dependencies

```json
{
  "firebase": "^12.1.0",
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "react-speech-recognition": "^4.0.1",
  "recharts": "^2.15.4",
  "@tanstack/react-query": "^5.85.5"
}
```

---

## 🐍 Python Server Dependencies

```bash
pip install flask flask-cors requests
```

---

## 📈 How Energy Monitoring Works

The ESP32 samples the voltage and current sensors for **200ms per reading** (covering ~10 full AC cycles at 50Hz) and computes the **Root Mean Square (RMS)** value digitally:

```
V_rms = sqrt(mean(samples²)) × calibration_factor
I_rms = sqrt(mean(samples²)) / sensitivity
Power (W) = V_rms × I_rms
Energy (kWh) += (Power / 1000) × elapsed_hours
```

Energy is saved to **EEPROM every 60 seconds** so it persists across power cuts and reboots.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ESP32 Hardware                   │
│  PIR │ Ultrasonic │ Flame │ Voltage │ Current │Relay│
└──────────────────────┬──────────────────────────────┘
                       │ Firebase SDK (WiFi)
                       ▼
┌─────────────────────────────────────────────────────┐
│           Firebase Realtime Database                │
│     /sensors   /relays   /timers   /commands        │
└──────────────────────┬──────────────────────────────┘
                       │ onValue() WebSocket listener
                       ▼
┌─────────────────────────────────────────────────────┐
│         React Dashboard (Vercel)                    │
│  WaterTank │ Electricity │ Relays │ Security │ Chat │
└──────────────────────┬──────────────────────────────┘
                       │ fetch() POST
                       ▼
┌─────────────────────────────────────────────────────┐
│     Python Flask Proxy (localhost:5001)             │
│  CORS bridge │ Keyword filter │ System prompt inject│
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
                       ▼
┌─────────────────────────────────────────────────────┐
│        Ollama LLM Server (localhost:11434)          │
│               Phi-3 Model (local)                   │
└─────────────────────────────────────────────────────┘
```

---

## 👥 Authors

- **Keshav** — Full stack development, ESP32 firmware, AI integration
- **Chahat** — Firebase backend, hardware assembly, testing

---

## 📄 License

This project is built as a college capstone project. Feel free to use it as a reference for your own IoT projects.

---

> *Powered by Ollama AI • Connected to Firebase • ESP32 @ Heart*
