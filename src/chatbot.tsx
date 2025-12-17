import { ref, set, get } from "firebase/database";
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
      set(ref(database, "relays/relay4"), true)
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
      set(ref(database, "relays/relay3"), false)
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
