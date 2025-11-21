
import React from 'react';

const NavBar: React.FC = () => {
  return (
    <nav className="bg-neutral-900 sticky top-0 z-50 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <a href="#" className="font-['Righteous'] text-2xl sm:text-3xl font-bold text-primary" aria-label="eTale Home">
              eTale
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
