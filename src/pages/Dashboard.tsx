import React, { useState } from 'react';
import { Home } from 'lucide-react';

// Hooks
import { useAuth } from '../hooks/useAuth';
import { useSensorData } from '../hooks/useSensorData';
import { useRelayControl } from '../hooks/useRelayControl';
import { useRelayTimers } from '../hooks/useRelayTimers';
import { useMotionAutomation } from '../hooks/useMotionAutomation';
import { useChatbot } from '../hooks/useChatbot';
import { useSettings } from '../hooks/useSettings';

// Services
import { turnOnAllRelays, turnOffAllRelays } from '../services/firebase/relay.service';

// Components
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { DashboardAlerts } from '../components/layout/DashboardAlerts';
import { WaterTankCard } from '../components/dashboard/WaterTankCard';
import { ElectricityCard } from '../components/dashboard/ElectricityCard';
import { RelayControlCard } from '../components/dashboard/RelayControlCard';
import { SecurityCard } from '../components/dashboard/SecurityCard';
import { CameraCard } from '../components/dashboard/CameraCard';
import { ChatbotCard } from '../components/dashboard/ChatbotCard';

// Utils
import { getWaterTankStatus } from '../utils/water-tank.utils';

const Dashboard: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { sensorData, connectionStatus } = useSensorData(user?.uid || null);
  const { relayStates, toggleRelay } = useRelayControl(user?.uid || null);
  const { activeTimers, remainingTimes, setTimer, cancelTimer } = useRelayTimers(user?.uid || null);
  const { messages, isTyping, sendMessage } = useChatbot(user?.uid || null);
  const { settings } = useSettings(user?.uid || null);

  // Motion automation - turns on lights when motion detected, auto-off after timeout
  useMotionAutomation({
    sensorData,
    motionSensorEnabled: settings.sensors.motionSensorEnabled,
    motionAutoEnabled: settings.automation?.motionLightsEnabled ?? true,
    autoOffMinutes: settings.automation?.motionAutoOffMinutes ?? 5,
    holidayMode: settings.automation?.holidayMode ?? false,
  });

  const [speechVolume, setSpeechVolume] = useState<number>(1.0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">{connectionStatus}</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be authenticated to access the dashboard.</p>
          <p className="text-sm text-gray-500 mt-2">Status: {connectionStatus}</p>
        </div>
      </div>
    );
  }

  const waterTankStatus = getWaterTankStatus(sensorData.waterLevel);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <DashboardHeader user={user} connectionStatus={connectionStatus} onLogout={logout} />

      {/* Alerts */}
      <DashboardAlerts sensorData={sensorData} waterTankStatus={waterTankStatus} />

      {/* Main Dashboard Grid - 2 Rows x 3 Columns */}
      <main className="max-w-7xl mx-auto p-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Row 1 */}
          {/* Water Level Monitoring */}
          <WaterTankCard
            waterLevel={sensorData.waterLevel}
            status={waterTankStatus}
            sensorEnabled={settings.sensors.waterSensorEnabled}
          />

          {/* Electricity Management */}
          <ElectricityCard
            voltage={sensorData.voltage}
            current={sensorData.current}
            power={sensorData.power}
            totalEnergyKwh={sensorData.totalEnergyKwh}
            unitPrice={settings.energy.unitPrice}
          />

          {/* Relay Control */}
          <RelayControlCard
            relayStates={relayStates}
            onToggle={toggleRelay}
            activeTimers={activeTimers}
            remainingTimes={remainingTimes}
            onSetTimer={setTimer}
            onCancelTimer={cancelTimer}
            onAllOn={turnOnAllRelays}
            onAllOff={turnOffAllRelays}
          />

          {/* Row 2 */}
          {/* Security & Sensors */}
          <SecurityCard
            flameDetected={sensorData.flameDetected}
            motionDetected={sensorData.motionDetected}
            lastUpdated={sensorData.lastUpdated}
            flameSensorEnabled={settings.sensors.flameSensorEnabled}
            motionSensorEnabled={settings.sensors.motionSensorEnabled}
          />

          {/* Security Camera */}
          <CameraCard
            isConnected={false}
            motionTriggered={sensorData.motionDetected}
            fireTriggered={sensorData.flameDetected}
          />

          {/* AI Chatbot */}
          <ChatbotCard
            messages={messages}
            isTyping={isTyping}
            speechVolume={speechVolume}
            sensorData={sensorData}
            relayStates={relayStates}
            onSendMessage={sendMessage}
            onVolumeChange={setSpeechVolume}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border/50 py-8 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Smart Home Automation Project</p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Powered by Ollama AI • Connected to Firebase
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;