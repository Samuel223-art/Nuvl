
import React, { useState, useEffect } from 'react';

// Reusable component for a settings section with an optional title
const SettingsSection: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <section className={`mb-4 ${className}`}>
    {title && <h2 className="text-sm font-bold text-neutral-500 uppercase px-4 pb-2 pt-4">{title}</h2>}
    <div className="bg-neutral-800 rounded-lg divide-y divide-neutral-700/50">
      {children}
    </div>
  </section>
);

// Reusable component for a standard settings item (label, value, chevron)
const SettingsItem: React.FC<{ label: string; subLabel?: string; value?: string; onClick?: () => void; hasChevron?: boolean }> = ({ label, subLabel, value, onClick, hasChevron = true }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between text-left px-4 py-3.5 hover:bg-neutral-700/50 transition-colors disabled:hover:bg-transparent disabled:cursor-default">
    <div>
      <p className="text-white text-base">{label}</p>
      {subLabel && <p className="text-neutral-400 text-sm mt-1">{subLabel}</p>}
    </div>
    <div className="flex items-center space-x-3">
      {value && <span className="text-neutral-400 text-base">{value}</span>}
      {hasChevron && <i className="fas fa-chevron-right text-neutral-500"></i>}
    </div>
  </button>
);

// Reusable component for a settings item with a toggle switch
const SettingsToggleItem: React.FC<{ label: string; subLabel?: string; isEnabled: boolean; onToggle: () => void; }> = ({ label, subLabel, isEnabled, onToggle }) => (
    <div className="w-full flex items-center justify-between text-left px-4 py-3.5">
        <div>
            <p className="text-white text-base">{label}</p>
            {subLabel && <p className="text-neutral-400 text-sm mt-1">{subLabel}</p>}
        </div>
        <label htmlFor={`toggle-${label.replace(/\s+/g, '-')}`} className="flex items-center cursor-pointer">
            <div className="relative">
                <input
                    type="checkbox"
                    id={`toggle-${label.replace(/\s+/g, '-')}`}
                    className="sr-only"
                    checked={isEnabled}
                    onChange={onToggle}
                    aria-label={label}
                />
                <div className={`block w-12 h-6 rounded-full transition-colors ${isEnabled ? 'bg-primary' : 'bg-neutral-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isEnabled ? 'transform translate-x-6' : ''}`}></div>
            </div>
        </label>
    </div>
);

// Modal component for cache clearing
const ClearCacheModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; cacheSize: string; }> = ({ isOpen, onClose, onConfirm, cacheSize }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Clear Cache</h2>
          <p className="text-neutral-400 mb-6">
            This will remove all downloaded stories ({cacheSize}) from your device. Your library and reading progress will not be affected.
          </p>
        </div>
        <div className="bg-neutral-700/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button onClick={onClose} className="py-2 px-4 bg-neutral-600 text-white font-semibold rounded-lg hover:bg-neutral-500 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};


// User profile interface to match data passed from App.tsx
interface UserProfile {
  username: string;
  email: string;
  coins: number;
  role?: string;
}
interface SettingsPageProps {
  onBack: () => void;
  profile: UserProfile | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, profile, onLogout, onNavigate }) => {
    // Dummy state for notifications
    const [notifications, setNotifications] = useState({
        service: true,
        topComment: true,
        replies: true,
    });
    
    const [volumeKeySwitchEnabled, setVolumeKeySwitchEnabled] = useState(() => {
        try {
            const item = localStorage.getItem('eTaleVolumeKeySwitch');
            return item ? JSON.parse(item) : true;
        } catch {
            return true;
        }
    });
    const [cacheSize, setCacheSize] = useState(0);
    const [isClearCacheModalVisible, setIsClearCacheModalVisible] = useState(false);

    const calculateCacheSize = () => {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('eTale-novel-')) {
                const value = localStorage.getItem(key);
                if (value) {
                    total += new Blob([key, value]).size;
                }
            }
        }
        setCacheSize(total);
    };

    useEffect(() => {
        calculateCacheSize();
    }, []);

    const formatCacheSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleClearCache = () => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('eTale-novel-')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        calculateCacheSize(); // Recalculate to confirm it's 0
        setIsClearCacheModalVisible(false);
    };

    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleToggleVolumeSwitch = () => {
        const newValue = !volumeKeySwitchEnabled;
        setVolumeKeySwitchEnabled(newValue);
        try {
            localStorage.setItem('eTaleVolumeKeySwitch', JSON.stringify(newValue));
        } catch (e) {
            console.error("Could not save volume key setting", e);
        }
    };

    return (
        <div className="pb-10">
            <ClearCacheModal 
                isOpen={isClearCacheModalVisible}
                onClose={() => setIsClearCacheModalVisible(false)}
                onConfirm={handleClearCache}
                cacheSize={formatCacheSize(cacheSize)}
            />

            <header className="sticky top-0 z-10 bg-neutral-900">
                <div className="relative flex items-center justify-center py-4 px-4">
                    <button onClick={onBack} className="absolute left-4 text-white" aria-label="Go back">
                        <i className="fas fa-chevron-left text-2xl"></i>
                    </button>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                </div>
            </header>

            <main className="mt-4 px-4">
                <SettingsSection title="Account">
                    <div className="w-full flex items-center text-left px-4 py-3.5">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-4">
                            <i className="fab fa-google text-red-500 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-white text-base font-semibold">{profile?.username || 'Guest User'}</p>
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection title="Nickname">
                    <SettingsItem label={profile?.username || 'N/A'} hasChevron={false} />
                </SettingsSection>

                <SettingsSection title="Email">
                    <SettingsItem label={profile?.email || 'no-email@example.com'} hasChevron={false}/>
                </SettingsSection>

                <SettingsSection title="Options">
                    <SettingsItem label="Content Language" />
                    <SettingsItem label="Reader Display" onClick={() => onNavigate('ReaderThemeSelector')} />
                </SettingsSection>

                <SettingsSection>
                    <SettingsItem label="Clear Cache" value={formatCacheSize(cacheSize)} hasChevron={false} onClick={() => setIsClearCacheModalVisible(true)} />
                    <SettingsItem label="Manage Devices" onClick={() => onNavigate('ManageDevices')} />
                    <SettingsToggleItem label="Switch between chapters with volume key" isEnabled={volumeKeySwitchEnabled} onToggle={handleToggleVolumeSwitch} />
                </SettingsSection>

                <SettingsSection title="Notifications">
                    <SettingsToggleItem label="Service Notifications" isEnabled={notifications.service} onToggle={() => handleNotificationToggle('service')} />
                    <SettingsToggleItem label="Top Comment" isEnabled={notifications.topComment} onToggle={() => handleNotificationToggle('topComment')} />
                    <SettingsToggleItem label="Replies" isEnabled={notifications.replies} onToggle={() => handleNotificationToggle('replies')} />
                </SettingsSection>

                <SettingsSection>
                    <SettingsItem label="Sync reading history to account" />
                </SettingsSection>

                <SettingsSection title="About">
                    <SettingsItem label="Notice" onClick={() => onNavigate('Notice')}/>
                    <SettingsItem label="Help" onClick={() => onNavigate('Help')}/>
                    <SettingsItem label="Terms of Use" onClick={() => onNavigate('TermsOfUse')}/>
                    <SettingsItem label="Privacy Policy" onClick={() => onNavigate('PrivacyPolicy')}/>
                    <SettingsItem label="Disclaimer" onClick={() => onNavigate('Disclaimer')} />
                    <SettingsItem label="App Version" value="1.0.0" onClick={() => onNavigate('AppVersion')} />
                </SettingsSection>

                {profile?.role === 'developer' && (
                    <SettingsSection title="Developer">
                        <SettingsItem label="Developer Center" onClick={() => onNavigate('DeveloperCenter')} />
                    </SettingsSection>
                )}

                <div className="mt-8">
                  <button 
                    onClick={onLogout}
                    className="w-full py-3 bg-neutral-800 text-red-500 font-bold rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                    Log Out
                  </button>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
