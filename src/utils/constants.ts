// Ollama Configuration
export const OLLAMA_CONFIG = {
    BASE_URL: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:5001/ollama',
    CHAT_URL: import.meta.env.VITE_OLLAMA_CHAT_URL || 'http://localhost:5001/ollama/chat',
    MODEL: 'phi3',
    TIMEOUT: 60000,
} as const;

// Firebase Paths
export const FIREBASE_PATHS = {
    SENSORS: 'sensors',
    RELAYS: 'relays',
    SENSOR_DISTANCE: 'sensors/distance',
    SENSOR_VOLTAGE: 'sensors/voltage',
    SENSOR_CURRENT: 'sensors/current',
    SENSOR_POWER: 'sensors/power',
    SENSOR_FLAME: 'sensors/flame',
    SENSOR_MOTION: 'sensors/motion',
} as const;

// Relay Configuration
export const RELAY_CONFIG = {
    ACTIVE_LOW: true, // Relays are active low (false = ON, true = OFF)
} as const;

// Water Tank Thresholds (in cm)
export const WATER_TANK_THRESHOLDS = {
    OVERFLOW: 5,
    FULL: 10,
    NORMAL_HIGH: 20,
    NORMAL_LOW: 35,
    LOW: 45,
} as const;

// UI Text
export const UI_TEXT = {
    WELCOME_MESSAGE: "Hello! I'm your AI-powered smart home assistant. I can help you control devices, check status, and answer questions. Try 'turn on light 1' or 'check water level'!",
    CHATBOT_PLACEHOLDER: "Ask me anything about your home...",
    CHATBOT_SUGGESTIONS: "• \"Turn on light 1\" • \"Check water level\" • \"Fan status\" • \"Turn off all lights\"",
} as const;

// Device Names
export const DEVICE_NAMES = {
    relay1: 'Light 1',
    relay2: 'Light 2',
    relay3: 'Fan',
    relay4: 'Extra Device',
} as const;
