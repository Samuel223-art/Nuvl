
import React from 'react';

const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const LibraryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const MeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

interface NavItemProps {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
      isActive ? 'text-primary' : 'text-neutral-400 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    <span className="text-[10px] sm:text-xs mt-1 font-medium">{label}</span>
  </button>
);

interface BottomNavBarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activePage, onPageChange }) => {
  const navItems = [
    { id: 'Home', Icon: HomeIcon, label: 'Home' },
    { id: 'Library', Icon: LibraryIcon, label: 'Library' },
    { id: 'Featured', Icon: StarIcon, label: 'Featured' },
    { id: 'Search', Icon: SearchIcon, label: 'Search' },
    { id: 'Me', Icon: MeIcon, label: 'Me' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 z-50">
      <div className="max-w-7xl mx-auto flex justify-around h-14 sm:h-16">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            Icon={item.Icon}
            label={item.label}
            isActive={activePage === item.id}
            onClick={() => onPageChange(item.id)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
