import React, { useState } from 'react';
import { Home } from 'lucide-react';

// Hooks
import { useAuth } from '../hooks/useAuth';
import { useSensorData } from '../hooks/useSensorData';
import { useRelayControl } from '../hooks/useRelayControl';
import { useChatbot } from '../hooks/useChatbot';

// Components
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { DashboardAlerts } from '../components/layout/DashboardAlerts';
import { WaterTankCard } from '../components/dashboard/WaterTankCard';
import { ElectricityCard } from '../components/dashboard/ElectricityCard';
import { RelayControlCard } from '../components/dashboard/RelayControlCard';
import { SecurityCard } from '../components/dashboard/SecurityCard';
import { ChatbotCard } from '../components/dashboard/ChatbotCard';

// Utils
import { getWaterTankStatus } from '../utils/water-tank.utils';

const Dashboard: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { sensorData, connectionStatus } = useSensorData(user?.uid || null);
  const { relayStates, toggleRelay } = useRelayControl(user?.uid || null);
  const { messages, isTyping, sendMessage } = useChatbot(user?.uid || null);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader user={user} connectionStatus={connectionStatus} onLogout={logout} />

      {/* Alerts */}
      <DashboardAlerts sensorData={sensorData} waterTankStatus={waterTankStatus} />

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto p-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Water Level Monitoring */}
          <WaterTankCard waterLevel={sensorData.waterLevel} status={waterTankStatus} />

          {/* Electricity Management */}
          <ElectricityCard
            voltage={sensorData.voltage}
            current={sensorData.current}
            power={sensorData.power}
          />

          {/* Relay Control */}
          <RelayControlCard relayStates={relayStates} onToggle={toggleRelay} />

          {/* Security & Sensors */}
          <SecurityCard
            flameDetected={sensorData.flameDetected}
            motionDetected={sensorData.motionDetected}
            lastUpdated={sensorData.lastUpdated}
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
      <footer className="mt-16 bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">© 2025 Smart Home Automation Project</p>
          <p className="text-xs text-gray-500 mt-1">
            Powered by Ollama AI • Connected to Firebase
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;