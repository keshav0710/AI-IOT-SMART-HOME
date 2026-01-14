#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <EEPROM.h>  // ADD: For persisting energy across reboots
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// 📡 WiFi Credentials
char ssid[] = "Keshav";
char pass[] = "Keshav@123";

// 🔥 Firebase Configuration
#define API_KEY "AIzaSyC44s2jxX1h_-fv3j_kmLvXwTeD9WpelBQ"
#define DATABASE_URL "https://smart-home-esp32-1406c-default-rtdb.asia-southeast1.firebasedatabase.app"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// 🔌 Pin Definitions
#define TRIG 5
#define ECHO 18
#define PIR 21
#define FLAME 19
#define LED1 25
#define LED2 26
#define BUZZER 27
#define RELAY1 23
#define RELAY2 22
#define RELAY3 13
#define RELAY4 12

// ⚡ VOLTAGE AND CURRENT SENSOR PINS
#define VOLTAGE_SENSOR A0    // Analog pin for voltage sensor (e.g., ZMPT101B)
#define CURRENT_SENSOR A3    // Analog pin for current sensor (e.g., ACS712)

// 📊 Sensor Calibration Constants
const float VOLTAGE_CALIBRATION = 234.26;  // Calibration factor for voltage sensor
const float CURRENT_CALIBRATION = 0.066;   // For ACS712-30A: 66mV per Amp
const float VOLTAGE_OFFSET = 2500.0;       // ADC offset (usually 2.5V for 5V systems)
const int ADC_RESOLUTION = 4096;           // 12-bit ADC resolution
const float ADC_VOLTAGE = 3.3;             // ESP32 ADC reference voltage

// ⏳ Timer Variables
#define UPDATE_INTERVAL 2000  // 2 seconds for sensor readings
unsigned long previousMillis = 0;

// ⚡ ADD: Energy tracking variables
unsigned long lastEnergyUpdateMillis = 0;
#define ENERGY_SAVE_INTERVAL 60000  // Save to EEPROM every 60 seconds
unsigned long lastEnergySaveMillis = 0;
#define EEPROM_ENERGY_ADDR 0  // EEPROM address for storing energy

// Timer variables for relays
unsigned long relay1Timer = 0;
unsigned long relay2Timer = 0;
unsigned long relay3Timer = 0;
unsigned long relay4Timer = 0;

// 📈 Sensor Variables
float voltage = 0.0;
float current = 0.0;
float power = 0.0;
float totalEnergyKwh = 0.0;  // ADD: Accumulated energy in kWh

void setup() {
    Serial.begin(115200);
    Serial.println("ESP32 Smart Home with Energy Monitoring Starting...");

    // 📦 ADD: Initialize EEPROM and load saved energy value
    EEPROM.begin(512);
    loadEnergyFromEEPROM();

    // 🌐 Connect to WiFi
    WiFi.begin(ssid, pass);
    Serial.print("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(1000);
    }
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    // 🔥 Initialize Firebase
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    auth.user.email = "faujdarchahat2002@gmail.com";
    auth.user.password = "Chahat@12345";

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    Serial.println("Firebase Connected!");

    // ⚡ Set Pin Modes
    pinMode(TRIG, OUTPUT);
    pinMode(ECHO, INPUT);
    pinMode(PIR, INPUT);
    pinMode(FLAME, INPUT);
    pinMode(LED1, OUTPUT);
    pinMode(LED2, OUTPUT);
    pinMode(BUZZER, OUTPUT);
    pinMode(RELAY1, OUTPUT);
    pinMode(RELAY2, OUTPUT);
    pinMode(RELAY3, OUTPUT);
    pinMode(RELAY4, OUTPUT);

    // Initialize analog pins (ESP32 doesn't need pinMode for analog)
    Serial.println("Voltage Sensor on pin A0 (GPIO36)");
    Serial.println("Current Sensor on pin A3 (GPIO39)");

    // 📡 Send initial values to Firebase
    Firebase.RTDB.setFloat(&fbdo, "/sensors/voltage", 0.0);
    Firebase.RTDB.setFloat(&fbdo, "/sensors/current", 0.0);
    Firebase.RTDB.setFloat(&fbdo, "/sensors/power", 0.0);
    Firebase.RTDB.setFloat(&fbdo, "/sensors/totalEnergyKwh", totalEnergyKwh);  // ADD
    Firebase.RTDB.setInt(&fbdo, "/sensors/timestamp", millis());

    // Initialize energy tracking timer
    lastEnergyUpdateMillis = millis();
    lastEnergySaveMillis = millis();

    Serial.print("Loaded Energy from EEPROM: ");
    Serial.print(totalEnergyKwh, 4);
    Serial.println(" kWh");

    Serial.println("Setup Complete!");
    delay(2000);
}

void loop() {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= UPDATE_INTERVAL) {
        previousMillis = currentMillis;

        Serial.println("=== Reading Sensors ===");

        // 🔎 PIR Sensor
        int motionDetected = digitalRead(PIR);
        Serial.print("PIR Sensor: ");
        Serial.println(motionDetected ? "Motion Detected" : "No Motion");
        digitalWrite(LED1, motionDetected);
        Firebase.RTDB.setInt(&fbdo, "/sensors/motion", motionDetected);

        // 📏 Ultrasonic Sensor
        long duration;
        int distance;
        digitalWrite(TRIG, LOW);
        delayMicroseconds(2);
        digitalWrite(TRIG, HIGH);
        delayMicroseconds(10);
        digitalWrite(TRIG, LOW);
        duration = pulseIn(ECHO, HIGH);
        distance = duration * 0.034 / 2;

        Serial.print("Water Distance: ");
        Serial.print(distance);
        Serial.println(" cm");

        Firebase.RTDB.setFloat(&fbdo, "/sensors/distance", distance);
        digitalWrite(LED2, distance < 30 ? HIGH : LOW);

        // 🔥 Flame Sensor
        int flameDetected = digitalRead(FLAME);
        Serial.print("Flame Sensor: ");
        Serial.println(flameDetected == LOW ? "🔥 FIRE DETECTED!" : "Safe");

        if (flameDetected == LOW) {
            digitalWrite(BUZZER, HIGH);
            Firebase.RTDB.setInt(&fbdo, "/sensors/flame", 1);
        } else {
            digitalWrite(BUZZER, LOW);
            Firebase.RTDB.setInt(&fbdo, "/sensors/flame", 0);
        }

        // ⚡ VOLTAGE AND CURRENT SENSORS
        readVoltageCurrent();
        
        // ⚡ ADD: Calculate and accumulate energy
        calculateEnergy();
        
        // 📊 Send all sensor data to Firebase
        sendSensorDataToFirebase();

        // 🚦 Relay control
        checkFirebaseCommands();
        handleRelayTimers();
        
        // 💾 ADD: Save energy to EEPROM periodically
        saveEnergyToEEPROM();

        Serial.println("========================");
        delay(100); // Small delay to prevent sensor interference
    }
}

// ⚡ Read Voltage and Current Sensors
void readVoltageCurrent() {
    // 🔋 Voltage Sensor Reading (ZMPT101B or similar)
    int voltageRaw = 0;
    int currentRaw = 0;
    
    // Take multiple readings for accuracy
    for(int i = 0; i < 100; i++) {
        voltageRaw += analogRead(VOLTAGE_SENSOR);
        currentRaw += analogRead(CURRENT_SENSOR);
        delayMicroseconds(100);
    }
    
    voltageRaw = voltageRaw / 100;  // Average
    currentRaw = currentRaw / 100;  // Average

    // Convert ADC reading to voltage
    float voltageADC = (voltageRaw * ADC_VOLTAGE) / ADC_RESOLUTION;
    float currentADC = (currentRaw * ADC_VOLTAGE) / ADC_RESOLUTION;

    // Calculate actual voltage (for ZMPT101B voltage sensor)
    // Adjust VOLTAGE_CALIBRATION based on your specific sensor and setup
    voltage = voltageADC * VOLTAGE_CALIBRATION;

    // Calculate actual current (for ACS712 current sensor)
    // ACS712-5A: 185mV/A, ACS712-20A: 100mV/A, ACS712-30A: 66mV/A
    current = abs((currentADC - (ADC_VOLTAGE/2)) / CURRENT_CALIBRATION);
    
    // Noise filtering - ignore very small currents
    if (current < 0.1) {
        current = 0.0;
    }
    
    // Calculate power
    power = voltage * current;

    // 📊 Print readings
    Serial.print("Voltage ADC: ");
    Serial.print(voltageADC);
    Serial.print("V -> Actual Voltage: ");
    Serial.print(voltage);
    Serial.println("V");
    
    Serial.print("Current ADC: ");
    Serial.print(currentADC);
    Serial.print("V -> Actual Current: ");
    Serial.print(current);
    Serial.println("A");
    
    Serial.print("Power: ");
    Serial.print(power);
    Serial.println("W");
}

// ⚡ ADD: Calculate energy consumption (kWh)
void calculateEnergy() {
    unsigned long currentMillis = millis();
    unsigned long elapsedMs = currentMillis - lastEnergyUpdateMillis;
    lastEnergyUpdateMillis = currentMillis;
    
    // Convert milliseconds to hours
    float elapsedHours = elapsedMs / 3600000.0;  // 1 hour = 3,600,000 ms
    
    // Calculate energy consumed in this interval (kWh = kW × hours)
    float energyConsumed = (power / 1000.0) * elapsedHours;  // Power in kW × time in hours
    
    // Add to total energy
    totalEnergyKwh += energyConsumed;
    
    // 📊 Print energy info
    Serial.print("⚡ Energy this interval: ");
    Serial.print(energyConsumed, 6);
    Serial.println(" kWh");
    
    Serial.print("⚡ Total Energy: ");
    Serial.print(totalEnergyKwh, 4);
    Serial.println(" kWh");
}

// 📡 Send all sensor data to Firebase
void sendSensorDataToFirebase() {
    // Create a timestamp
    unsigned long timestamp = millis();
    
    // Send voltage, current, power, and ENERGY data
    Firebase.RTDB.setFloat(&fbdo, "/sensors/voltage", voltage);
    Firebase.RTDB.setFloat(&fbdo, "/sensors/current", current);
    Firebase.RTDB.setFloat(&fbdo, "/sensors/power", power);
    Firebase.RTDB.setFloat(&fbdo, "/sensors/totalEnergyKwh", totalEnergyKwh);  // ADD: Energy in kWh
    Firebase.RTDB.setInt(&fbdo, "/sensors/timestamp", timestamp);
    
    Serial.println("✅ Sensor data sent to Firebase");
}

// 💾 ADD: Load energy from EEPROM (persists across reboots)
void loadEnergyFromEEPROM() {
    float storedEnergy;
    EEPROM.get(EEPROM_ENERGY_ADDR, storedEnergy);
    
    // Check if the value is valid (not NaN or infinity)
    if (isnan(storedEnergy) || isinf(storedEnergy) || storedEnergy < 0) {
        totalEnergyKwh = 0.0;
        Serial.println("⚠️ Invalid EEPROM data, starting from 0 kWh");
    } else {
        totalEnergyKwh = storedEnergy;
        Serial.print("📦 Loaded from EEPROM: ");
        Serial.print(totalEnergyKwh, 4);
        Serial.println(" kWh");
    }
}

// 💾 ADD: Save energy to EEPROM periodically
void saveEnergyToEEPROM() {
    unsigned long currentMillis = millis();
    
    // Only save every ENERGY_SAVE_INTERVAL (60 seconds) to reduce EEPROM wear
    if (currentMillis - lastEnergySaveMillis >= ENERGY_SAVE_INTERVAL) {
        lastEnergySaveMillis = currentMillis;
        
        EEPROM.put(EEPROM_ENERGY_ADDR, totalEnergyKwh);
        EEPROM.commit();
        
        Serial.print("💾 Energy saved to EEPROM: ");
        Serial.print(totalEnergyKwh, 4);
        Serial.println(" kWh");
    }
}

// ✅ ADD: Function to reset energy counter (call from Firebase command if needed)
void resetEnergyCounter() {
    totalEnergyKwh = 0.0;
    EEPROM.put(EEPROM_ENERGY_ADDR, totalEnergyKwh);
    EEPROM.commit();
    Firebase.RTDB.setFloat(&fbdo, "/sensors/totalEnergyKwh", totalEnergyKwh);
    Serial.println("🔄 Energy counter reset to 0");
}

// ✅ Relay Controls (Logic: 1 = ON, 0 = OFF)
void checkFirebaseCommands() {
    // Check for energy reset command
    if (Firebase.RTDB.getInt(&fbdo, "/commands/resetEnergy")) {
        int resetCmd = fbdo.intData();
        if (resetCmd == 1) {
            resetEnergyCounter();
            Firebase.RTDB.setInt(&fbdo, "/commands/resetEnergy", 0);  // Clear the command
        }
    }

    // Read relay commands from Firebase
    if (Firebase.RTDB.getInt(&fbdo, "/relays/relay1")) {
        int relay1State = fbdo.intData();
        digitalWrite(RELAY1, relay1State == 1 ? HIGH : LOW);
        Serial.print("Relay 1 (Light 1): ");
        Serial.println(relay1State == 1 ? "ON" : "OFF");
    }

    if (Firebase.RTDB.getInt(&fbdo, "/relays/relay2")) {
        int relay2State = fbdo.intData();
        digitalWrite(RELAY2, relay2State == 1 ? HIGH : LOW);
        Serial.print("Relay 2 (Light 2): ");
        Serial.println(relay2State == 1 ? "ON" : "OFF");
    }

    if (Firebase.RTDB.getInt(&fbdo, "/relays/relay3")) {
        int relay3State = fbdo.intData();
        digitalWrite(RELAY3, relay3State == 1 ? HIGH : LOW);
        Serial.print("Relay 3 (Fan): ");
        Serial.println(relay3State == 1 ? "ON" : "OFF");
    }

    if (Firebase.RTDB.getInt(&fbdo, "/relays/relay4")) {
        int relay4State = fbdo.intData();
        digitalWrite(RELAY4, relay4State == 1 ? HIGH : LOW);
        Serial.print("Relay 4 (Extra): ");
        Serial.println(relay4State == 1 ? "ON" : "OFF");
    }
}

// ⏱️ Relay Auto-OFF Timers (Optional Feature)
void handleRelayTimers() {
    unsigned long currentMillis = millis();

    // Auto-turn OFF relays after specified time (currently disabled)
    // Uncomment and modify as needed
    
    /*
    if (relay1Timer > 0 && currentMillis - relay1Timer >= 300000) { // 5 minutes
        digitalWrite(RELAY1, LOW);
        Firebase.RTDB.setInt(&fbdo, "/relays/relay1", 0);
        relay1Timer = 0;
        Serial.println("🔌 Relay 1 Auto-OFF (Timer)");
    }
    */
}
