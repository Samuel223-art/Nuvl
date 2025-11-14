import React, { useState, useEffect } from 'react';

// Common header for static pages
const StaticPageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="sticky top-0 z-10 bg-neutral-900">
    <div className="relative flex items-center justify-center py-4 px-4">
      <button onClick={onBack} className="absolute left-4 text-white" aria-label="Go back">
        <i className="fas fa-chevron-left text-2xl"></i>
      </button>
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </div>
  </header>
);

interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenResolution: string;
}

const DeviceInfoItem: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="flex justify-between items-center px-4 py-3.5">
        <p className="text-neutral-400">{label}</p>
        <p className="text-white text-right">{value}</p>
    </div>
);

const ManageDevicesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const getDeviceInfo = () => {
      setDeviceInfo({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${window.screen.width} x ${window.screen.height}`,
      });
    };
    getDeviceInfo();
  }, []);

  return (
    <div>
      <StaticPageHeader title="Manage Devices" onBack={onBack} />
      <main className="px-4 py-6 space-y-8">
        <section>
          <h2 className="text-sm font-bold text-neutral-500 uppercase px-4 pb-2">Current Device</h2>
          <div className="bg-neutral-800 rounded-lg divide-y divide-neutral-700/50">
            {deviceInfo ? (
              <>
                <DeviceInfoItem label="Platform" value={deviceInfo.platform || 'Unknown'} />
                <DeviceInfoItem label="Resolution" value={deviceInfo.screenResolution} />
                <div className="px-4 py-3.5">
                    <p className="text-neutral-400 mb-1">User Agent</p>
                    <p className="text-white text-sm break-all">{deviceInfo.userAgent}</p>
                </div>
              </>
            ) : (
              <p className="p-4 text-neutral-400">Loading device information...</p>
            )}
          </div>
        </section>

        <div className="mt-8">
          <button className="w-full py-3 bg-neutral-800 text-red-500 font-bold rounded-lg hover:bg-neutral-700 transition-colors">
            Sign out on all devices
          </button>
        </div>
      </main>
    </div>
  );
};

export default ManageDevicesPage;
