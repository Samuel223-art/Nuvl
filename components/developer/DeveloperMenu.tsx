import React from 'react';

interface DeveloperMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
}

const NavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 text-lg ${
      isActive ? 'bg-primary text-black font-bold' : 'text-neutral-300 hover:bg-neutral-700'
    }`}
  >
    <i className={`fas ${icon} w-6 text-center`}></i>
    <span className="ml-4 font-medium">{label}</span>
  </button>
);

const DeveloperMenu: React.FC<DeveloperMenuProps> = ({ isOpen, onClose, activeView, onSelectView }) => {
  const menuItems = [
    { id: 'Overview', icon: 'fa-tachometer-alt', label: 'Overview' },
    { id: 'Novels', icon: 'fa-book-open', label: 'Novels' },
    { id: 'Inbox', icon: 'fa-inbox', label: 'Inbox' },
    { id: 'Push', icon: 'fa-paper-plane', label: 'Push' },
    { id: 'Purchases', icon: 'fa-receipt', label: 'Purchases' },
    { id: 'Premium', icon: 'fa-crown', label: 'Premium' },
    { id: 'Notice', icon: 'fa-bullhorn', label: 'Notice' },
    { id: 'Settings', icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      {/* Menu */}
      <div className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-neutral-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-neutral-700">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors" aria-label="Close menu">
                <i className="fas fa-times text-2xl"></i>
            </button>
        </div>
        <nav className="p-4 space-y-3">
          {menuItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.id}
              onClick={() => onSelectView(item.id)}
            />
          ))}
        </nav>
      </div>
    </>
  );
};

export default DeveloperMenu;