import React, { useState, useEffect } from 'react'
import { telemetryService } from './services/api'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import SafetyHeroCard from './components/SafetyHeroCard'
import SensorMetricGrid from './components/SensorMetricGrid'
import TelemetryCharts from './components/TelemetryCharts'
import NodeMap from './components/NodeMap'
import AlertCenter from './components/AlertCenter'
import CameraScreeningPanel from './components/CameraScreeningPanel'
import ModelInsights from './components/ModelInsights'
import DeviceHealth from './components/DeviceHealth'
import WhatsAppModal from './components/WhatsAppModal'
import ThresholdConfigModal from './components/ThresholdConfigModal'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [latestData, setLatestData] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [alerts, setAlerts] = useState([])
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [isWaModalOpen, setIsWaModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const fetchData = async () => {
    try {
      const latestResp = await telemetryService.getLatest()
      setLatestData(latestResp.data)
      setLastSyncTime(new Date().toISOString())

      const historyResp = await telemetryService.getHistory()
      setHistoryData(historyResp.data)

      const alertsResp = await telemetryService.getAlerts()
      setAlerts(alertsResp.data)
    } catch (error) {
      console.error("Error fetching telemetry:", error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    
    // Listen for custom event from Navbar
    const handleWaOpen = () => setIsWaModalOpen(true)
    window.addEventListener('open-whatsapp-modal', handleWaOpen)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('open-whatsapp-modal', handleWaOpen)
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar lastSyncTime={lastSyncTime} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
            
            {/* Top Grid: Hero & Map */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto xl:h-[300px]">
              <div className="xl:col-span-7 h-full">
                <SafetyHeroCard latestData={latestData} />
              </div>
              <div className="xl:col-span-5 h-[300px] xl:h-full">
                <NodeMap latestData={latestData} />
              </div>
            </div>

            {/* Middle Section: Sensor Cards */}
            <div className="w-full">
              <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4 pl-1">Live Telemetry</h3>
              <SensorMetricGrid latestData={latestData} historyData={historyData} />
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8">
                <TelemetryCharts historyData={historyData} />
              </div>
              <div className="xl:col-span-4 h-[400px]">
                <AlertCenter alerts={alerts} />
              </div>
            </div>

            {/* Intelligence & Hardware Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CameraScreeningPanel />
              <ModelInsights latestData={latestData} />
              <DeviceHealth />
            </div>
            
          </div>
        </main>
      </div>

      <WhatsAppModal isOpen={isWaModalOpen} onClose={() => setIsWaModalOpen(false)} />
      <ThresholdConfigModal />
    </div>
  )
}

export default App
