import { ref, set, get, remove } from "firebase/database";
import { database } from "./firebase";

/* =========================================================
   🔹 OLLAMA CONFIGURATION (via Python Proxy)
   ========================================================= */
const OLLAMA_URL = "http://localhost:5001/ollama";
const OLLAMA_CHAT_URL = "http://localhost:5001/ollama/chat";
const OLLAMA_MODEL = "phi3:latest";  // Using full Phi3 model

/* =========================================================
   🔹 SPEAK RESPONSE ALOUD
   ========================================================= */
export function speakResponse(text, volume = 1.0) {
  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = volume;

    speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis not supported in this browser");
  }
}

/* =========================================================
   🔹 FIREBASE RELAY HELPERS
   ========================================================= */
async function toggleRelay(relayKey, state) {
  try {
    const relayRef = ref(database, `relays/${relayKey}`);
    const newState = state !== undefined ? state : true;
    // Invert for active low
    await set(relayRef, !newState);
    console.log(`✅ ${relayKey} set to ${!newState} (Logical: ${newState})`);
    return `${relayKey} toggled to ${newState ? "ON" : "OFF"}`;
  } catch (error) {
    console.error(`❌ Error toggling ${relayKey}:`, error);
    throw error;
  }
}

/* =========================================================
   🔹 TIMER HELPER FUNCTIONS
   ========================================================= */

// Parse duration from text like "2 hours", "30 minutes", "1 hour 30 minutes"
function parseTimerDuration(text) {
  const result = { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  const lowerText = text.toLowerCase();

  // Match hours
  const hourMatch = lowerText.match(/(\d+)\s*(hour|hr|h|ghante|ghanta)/);
  if (hourMatch) result.hours = parseInt(hourMatch[1]);

  // Match minutes
  const minMatch = lowerText.match(/(\d+)\s*(minute|min|m\b|mins)/);
  if (minMatch) result.minutes = parseInt(minMatch[1]);

  // Match seconds
  const secMatch = lowerText.match(/(\d+)\s*(second|sec|s\b|secs)/);
  if (secMatch) result.seconds = parseInt(secMatch[1]);

  result.totalSeconds = (result.hours * 3600) + (result.minutes * 60) + result.seconds;
  return result;
}

// Format seconds to readable string
function formatDurationText(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);

  return parts.join(' and ') || '0 seconds';
}

// Device name mappings
const DEVICE_MAP = {
  'light 1': 'relay1',
  'light one': 'relay1',
  'first light': 'relay1',
  'pehli light': 'relay1',
  'light 2': 'relay2',
  'light two': 'relay2',
  'second light': 'relay2',
  'dusri light': 'relay2',
  'fan': 'relay3',
  'pankha': 'relay3',
  'extra': 'relay4',
  'device 4': 'relay4',
  'relay 4': 'relay4',
};

const RELAY_NAMES = {
  'relay1': 'Light 1',
  'relay2': 'Light 2',
  'relay3': 'Fan',
  'relay4': 'Extra Device',
};

// Find relay from text
function findRelayFromText(text) {
  const lowerText = text.toLowerCase();
  for (const [keyword, relay] of Object.entries(DEVICE_MAP)) {
    if (lowerText.includes(keyword)) {
      return relay;
    }
  }
  // Fallback: check for generic "light" without number
  if (lowerText.includes('light') && !lowerText.includes('light 2')) {
    return 'relay1';
  }
  return null;
}

// Set timer from chatbot command
async function setRelayTimerFromChat(relayKey, hours, minutes, seconds, action) {
  try {
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds <= 0) return null;

    const now = Date.now();
    const timer = {
      relayKey,
      endTime: now + (totalSeconds * 1000),
      duration: totalSeconds,
      action,
      createdAt: now,
    };

    await set(ref(database, `timers/${relayKey}`), timer);
    console.log(`⏰ Timer set via chatbot: ${relayKey} will turn ${action} in ${formatDurationText(totalSeconds)}`);
    return timer;
  } catch (error) {
    console.error(`Error setting timer for ${relayKey}:`, error);
    return null;
  }
}

// Get active timers status
async function getActiveTimersStatus() {
  try {
    const snapshot = await get(ref(database, 'timers'));
    if (!snapshot.exists()) {
      return "No active timers. ⏰";
    }

    const timers = snapshot.val();
    const now = Date.now();
    const activeTimers = [];

    for (const [relayKey, timer] of Object.entries(timers) as [string, { endTime: number; action: string }][]) {
      const remaining = Math.max(0, Math.floor((timer.endTime - now) / 1000));
      if (remaining > 0) {
        activeTimers.push(`• ${RELAY_NAMES[relayKey]}: ${formatDurationText(remaining)} remaining → will turn ${timer.action.toUpperCase()}`);
      }
    }

    if (activeTimers.length === 0) {
      return "No active timers. ⏰";
    }

    return `Active timers:\n${activeTimers.join('\n')}`;
  } catch (error) {
    console.error('Error getting timer status:', error);
    return "Unable to fetch timer status.";
  }
}

// Cancel timer from chatbot
async function cancelRelayTimerFromChat(relayKey) {
  try {
    await remove(ref(database, `timers/${relayKey}`));
    console.log(`⏰ Timer cancelled for ${relayKey}`);
    return `Timer for ${RELAY_NAMES[relayKey]} cancelled! ⏰`;
  } catch (error) {
    console.error(`Error cancelling timer for ${relayKey}:`, error);
    return `Unable to cancel timer for ${RELAY_NAMES[relayKey]}.`;
  }
}

async function getRelayStatus(relayKey) {
  try {
    const relayRef = ref(database, `relays/${relayKey}`);
    const snapshot = await get(relayRef);

    if (!snapshot.exists()) {
      console.warn(`⚠️ ${relayKey} status unknown`);
      return "unknown";
    }

    const isOn = snapshot.val() === false || snapshot.val() === 0;
    return isOn ? "on" : "off";
  } catch (error) {
    console.error(`❌ Error getting ${relayKey} status:`, error);
    return "unknown";
  }
}

async function getWaterTankStatus() {
  try {
    const snapshot = await get(ref(database, "sensors/distance"));

    if (!snapshot.exists()) {
      return "Water level data unavailable.";
    }

    const distance = snapshot.val();
    let percentage, status;

    if (distance <= 5) {
      percentage = 95;
      status = "Overflow";
    } else if (distance <= 10) {
      percentage = 85;
      status = "Full";
    } else if (distance <= 20) {
      percentage = 70;
      status = "Normal";
    } else if (distance <= 35) {
      percentage = 45;
      status = "Normal";
    } else if (distance <= 45) {
      percentage = 20;
      status = "Low";
    } else {
      percentage = 5;
      status = "Empty";
    }

    return `Water tank is ${status} (${percentage}% full, distance: ${distance.toFixed(1)}cm from surface).`;
  } catch (error) {
    console.error("❌ Error getting water tank status:", error);
    return "Unable to fetch water tank data.";
  }
}

async function getAllSensorData() {
  try {
    const snapshot = await get(ref(database, "sensors"));

    if (!snapshot.exists()) {
      return "Sensor data unavailable.";
    }

    const data = snapshot.val();

    return (
      `Current system status:\n\n` +
      `* Voltage: ${data.voltage?.toFixed(1) || "N/A"}V\n` +
      `* Current: ${data.current?.toFixed(1) || "N/A"}A\n` +
      `* Power: ${data.power?.toFixed(1) || "N/A"}W\n` +
      `* Flame sensor: ${data.flame ? "🔥 FIRE DETECTED!" : "✓ Safe"}\n` +
      `* Motion sensor: ${data.motion ? "👤 Motion detected" : "✓ No motion"}\n` +
      `* Water distance: ${data.distance?.toFixed(1) || "N/A"}cm`
    );
  } catch (error) {
    console.error("❌ Error getting sensor data:", error);
    return "Unable to fetch sensor data.";
  }
}

async function turnOffAllDevices() {
  try {
    console.log("🔌 Turning off all devices...");
    await Promise.all([
      set(ref(database, "relays/relay1"), true),
      set(ref(database, "relays/relay2"), true),
      set(ref(database, "relays/relay3"), true),
      set(ref(database, "relays/relay4"), true),
    ]);
    console.log("✅ All devices turned off");
    return "All devices have been turned off! 🔌";
  } catch (error) {
    console.error("❌ Error turning off devices:", error);
    return "Sorry, I couldn't turn off all devices. Please try again.";
  }
}

async function turnOnAllDevices() {
  try {
    console.log("💡 Turning on all devices...");
    await Promise.all([
      set(ref(database, "relays/relay1"), false),
      set(ref(database, "relays/relay2"), false),
      set(ref(database, "relays/relay3"), false),
      set(ref(database, "relays/relay4"), false),
    ]);
    console.log("✅ All devices turned on");
    return "All lights and fan have been turned on! ✨";
  } catch (error) {
    console.error("❌ Error turning on devices:", error);
    return "Sorry, I couldn't turn on all devices. Please try again.";
  }
}

/* =========================================================
   🔹 HINGLISH COMMAND DETECTION
   ========================================================= */
async function handleCommand(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  console.log(`🎤 Processing command: "${msg}"`);

  // ===== TIMER COMMANDS =====

  // Check for timer status query
  if (msg.includes("timer") && (msg.includes("status") || msg.includes("active") || msg.includes("what") || msg.includes("check"))) {
    return await getActiveTimersStatus();
  }

  // Check for cancel timer command
  if (msg.includes("cancel") && msg.includes("timer")) {
    const relay = findRelayFromText(msg);
    if (relay) {
      return await cancelRelayTimerFromChat(relay);
    }
    return "Please specify which device timer to cancel. For example: 'cancel light 1 timer'";
  }

  // Check for timer command: "turn on/off X for Y time"
  const hasTimerKeyword = msg.includes("for ") || msg.includes("after ");
  if (hasTimerKeyword) {
    const duration = parseTimerDuration(msg);
    if (duration.totalSeconds > 0) {
      const relay = findRelayFromText(msg);
      if (relay) {
        // Determine action based on the command
        const isTurningOn = msg.includes("on") || msg.includes("chalu") || msg.includes("jala");
        const isTurningOff = msg.includes("off") || msg.includes("band") || msg.includes("bujha");

        // "turn on X for Y" = turn on now, then OFF after Y
        // "turn off X after Y" = turn off after Y
        if (isTurningOn) {
          // Turn on immediately, set timer to turn OFF
          await set(ref(database, `relays/${relay}`), false); // ON (active low)
          const timer = await setRelayTimerFromChat(relay, duration.hours, duration.minutes, duration.seconds, 'off');
          if (timer) {
            return `✅ ${RELAY_NAMES[relay]} turned ON! It will automatically turn OFF in ${formatDurationText(duration.totalSeconds)}. ⏰`;
          }
        } else if (isTurningOff) {
          // Just set timer to turn off (don't turn on now)
          const timer = await setRelayTimerFromChat(relay, duration.hours, duration.minutes, duration.seconds, 'off');
          if (timer) {
            return `✅ Timer set! ${RELAY_NAMES[relay]} will turn OFF in ${formatDurationText(duration.totalSeconds)}. ⏰`;
          }
        } else {
          // If just "light 1 for 2 hours" without on/off, assume it's currently off, turn on and schedule off
          await set(ref(database, `relays/${relay}`), false); // ON
          const timer = await setRelayTimerFromChat(relay, duration.hours, duration.minutes, duration.seconds, 'off');
          if (timer) {
            return `✅ ${RELAY_NAMES[relay]} turned ON! It will automatically turn OFF in ${formatDurationText(duration.totalSeconds)}. ⏰`;
          }
        }
      }
    }
  }

  // ===== REGULAR COMMANDS =====

  // Turn on/off all devices
  if (msg.includes("sab") && msg.includes("band")) {
    return await turnOffAllDevices();
  }
  if (msg.includes("sab") && (msg.includes("on") || msg.includes("chalu"))) {
    return await turnOnAllDevices();
  }

  // Helper to check for on/off
  const isTurningOn = msg.includes("on") || msg.includes("chalu") || msg.includes("jala") || msg.includes("start");
  const isTurningOff = msg.includes("off") || msg.includes("band") || msg.includes("bujha") || msg.includes("stop");

  if (!isTurningOn && !isTurningOff) {
    // If no action specified, check for status queries
    if (msg.includes("pani") || msg.includes("water") || msg.includes("tank")) {
      return await getWaterTankStatus();
    }
    if (msg.includes("status") || msg.includes("sensor") || msg.includes("system")) {
      return await getAllSensorData();
    }
    // If just a device name without action, maybe let AI handle or prompt for action?
    // For now, fall through to AI if no clear action.
  }

  // Check for "all lights" BEFORE individual lights to prevent partial matching
  if ((msg.includes("all lights") || msg.includes("both lights") || msg.includes("dono light")) && (isTurningOn || isTurningOff)) {
    if (isTurningOn) {
      await Promise.all([
        set(ref(database, "relays/relay1"), false),
        set(ref(database, "relays/relay2"), false)
      ]);
      return "Both lights turned ON 💡💡";
    }
    if (isTurningOff) {
      await Promise.all([
        set(ref(database, "relays/relay1"), true),
        set(ref(database, "relays/relay2"), true)
      ]);
      return "Both lights turned OFF 💡💡";
    }
  }

  // Light 2 (Relay 2) - Check this BEFORE Light 1 to avoid partial match
  if (msg.includes("light 2") || msg.includes("second light") || msg.includes("dusri light")) {
    if (isTurningOn) {
      await set(ref(database, "relays/relay2"), false);
      return "Light 2 turned ON 💡";
    }
    if (isTurningOff) {
      await set(ref(database, "relays/relay2"), true);
      return "Light 2 turned OFF 💡";
    }
  }

  // Light 1 (Relay 1)
  if (msg.includes("light 1") || msg.includes("first light") || msg.includes("pehli light") || (msg.includes("light") && !msg.includes("light 2"))) {
    if (isTurningOn) {
      await set(ref(database, "relays/relay1"), false);
      return "Light 1 turned ON 💡";
    }
    if (isTurningOff) {
      await set(ref(database, "relays/relay1"), true);
      return "Light 1 turned OFF 💡";
    }
  }

  // Fan (Relay 3)
  if (msg.includes("fan") || msg.includes("pankha")) {
    if (isTurningOn) {
      await set(ref(database, "relays/relay3"), false);
      return "Fan turned ON 🌀";
    }
    if (isTurningOff) {
      await set(ref(database, "relays/relay3"), true);
      return "Fan turned OFF 🌀";
    }
  }

  // Extra Device (Relay 4)
  if (msg.includes("extra") || msg.includes("relay 4") || msg.includes("device 4")) {
    if (isTurningOn) {
      await set(ref(database, "relays/relay4"), false);
      return "Extra Device turned ON 🔌";
    }
    if (isTurningOff) {
      await set(ref(database, "relays/relay4"), true);
      return "Extra Device turned OFF 🔌";
    }
  }

  // Water tank status (redundant check if not caught above, but good for safety)
  if (msg.includes("pani") || msg.includes("water") || msg.includes("tank")) {
    return await getWaterTankStatus();
  }

  // Sensor status
  if (msg.includes("status") || msg.includes("sensor") || msg.includes("system")) {
    return await getAllSensorData();
  }

  // No command matched, return null to let Ollama handle
  console.log("ℹ️ No command matched, sending to AI...");
  return null;
}

/* =========================================================
   🔹 BUILD SYSTEM CONTEXT FOR LLM
   ========================================================= */
function buildSystemContext(sensorData, relayStates) {
  if (!sensorData || !relayStates) {
    return "";
  }

  // Calculate water tank status
  const distance = sensorData.waterLevel || sensorData.distance || 0;
  let waterStatus = "Unknown";
  let waterPercentage = 0;

  if (distance <= 5) {
    waterStatus = "Overflow";
    waterPercentage = 95;
  } else if (distance <= 10) {
    waterStatus = "Full";
    waterPercentage = 85;
  } else if (distance <= 20) {
    waterStatus = "Normal";
    waterPercentage = 70;
  } else if (distance <= 35) {
    waterStatus = "Normal";
    waterPercentage = 45;
  } else if (distance <= 45) {
    waterStatus = "Low";
    waterPercentage = 20;
  } else {
    waterStatus = "Empty";
    waterPercentage = 5;
  }

  return `
CURRENT SMART HOME STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏠 DEVICES:
  • Light 1: ${relayStates.relay1 ? '🟢 ON' : '⚫ OFF'}
  • Light 2: ${relayStates.relay2 ? '🟢 ON' : '⚫ OFF'}
  • Fan: ${relayStates.relay3 ? '🟢 ON' : '⚫ OFF'}
  • Extra Device: ${relayStates.relay4 ? '🟢 ON' : '⚫ OFF'}

💧 WATER TANK:
  • Status: ${waterStatus}
  • Level: ${waterPercentage}% full
  • Distance to water: ${distance.toFixed(1)}cm

⚡ ELECTRICITY:
  • Voltage: ${sensorData.voltage?.toFixed(1) || 'N/A'}V
  • Current: ${sensorData.current?.toFixed(1) || 'N/A'}A
  • Power: ${sensorData.power?.toFixed(1) || 'N/A'}W

🛡️ SECURITY:
  • Flame Sensor: ${sensorData.flameDetected ? '🔥 FIRE DETECTED!' : '✅ Safe'}
  • Motion Sensor: ${sensorData.motionDetected ? '👤 Motion Detected' : '✅ No Motion'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use this information to answer the user's question accurately.
If they ask about device status, refer to the data above.
If they want to control devices, politely tell them to use commands like "turn on light 1".
`;
}

/* =========================================================
   🔹 MAIN CHATBOT FUNCTION
   ========================================================= */
export async function sendMessageToBot(userMessage, userId = "defaultUser", systemState = null) {
  try {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🗣️ User: ${userMessage}`);
    console.log(`${"=".repeat(60)}`);

    // First check if it's a control command
    const commandResponse = await handleCommand(userMessage);

    if (commandResponse) {
      console.log(`✅ Command executed: ${commandResponse}`);
      // speakResponse(commandResponse);
      return commandResponse;
    }

    // If not a command, send to Ollama AI with system context
    console.log("🔄 Sending to Ollama with system context...");

    // Detect if this is a casual greeting/chat (don't send system context)
    const casualPatterns = /^(hi|hello|hey|thanks|thank you|ok|okay|bye|goodbye|yes|no|cool|nice|great|awesome)\s*[!.?]*$/i;
    const isCasualMessage = casualPatterns.test(userMessage.trim());

    // Build context-aware prompt (skip for casual messages)
    const systemContext = (systemState && !isCasualMessage)
      ? buildSystemContext(systemState.sensorData, systemState.relayStates)
      : "";
    const contextualPrompt = systemContext
      ? `${systemContext}\n\nUser Question: ${userMessage}`
      : userMessage;

    if (isCasualMessage) {
      console.log("💬 Casual message detected, skipping system context");
    }

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: contextualPrompt
      })
    });

    console.log(`📡 Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Server error:", errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.response || "Sorry, I couldn't think of a reply.";

    console.log(`🤖 AI: ${aiResponse.substring(0, 100)}...`);
    console.log(`${"=".repeat(60)}\n`);

    // speakResponse(aiResponse);
    return aiResponse;

  } catch (error) {
    console.error("💥 Error:", error);

    let fallback = "Sorry, something went wrong!";

    if (error.message.includes("Failed to fetch")) {
      fallback = "Cannot connect to server. Make sure Python server is running on port 5001.";
      console.error("🔧 Fix: Run 'python ollama_server.py'");
    } else if (error.message.includes("Ollama")) {
      fallback = "Ollama is not responding. Make sure it's running.";
      console.error("🔧 Fix: Run 'ollama serve'");
    } else if (error.message.includes("timeout")) {
      fallback = "The AI is taking too long. Please try again.";
    }

    // speakResponse(fallback);
    return fallback;
  }
}

/* =========================================================
   🔹 ALTERNATIVE: WITH CONVERSATION HISTORY
   ========================================================= */
let conversationHistory = [];

export async function sendMessageToBotWithHistory(userMessage, userId = "defaultUser") {
  try {
    // Check for commands first
    const commandResponse = await handleCommand(userMessage);
    if (commandResponse) {
      // speakResponse(commandResponse);
      return commandResponse;
    }

    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: userMessage
    });

    console.log(`💬 Sending chat with ${conversationHistory.length} messages`);

    // Send to chat endpoint
    const response = await fetch(OLLAMA_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.response || "Sorry, I couldn't think of a reply.";

    // Add AI response to history
    conversationHistory.push({
      role: "assistant",
      content: aiResponse
    });

    // Keep only last 10 messages
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    console.log(`✅ Chat response received`);

    // speakResponse(aiResponse);
    return aiResponse;

  } catch (error) {
    console.error("💥 Chat error:", error);
    const fallback = "Sorry, something went wrong with the chat!";
    // speakResponse(fallback);
    return fallback;
  }
}

// Clear conversation history
export function clearChatHistory() {
  conversationHistory = [];
  console.log("🗑️ Chat history cleared");
}

// Export for testing
export { handleCommand, getWaterTankStatus, getAllSensorData };
