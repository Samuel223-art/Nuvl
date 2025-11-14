
import React from 'react';

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

const AppVersionPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div>
      <StaticPageHeader title="App Version" onBack={onBack} />
      <main className="px-4 py-6 text-center">
        <div className="flex flex-col items-center justify-center h-full pt-16">
          <div className="font-['Righteous'] text-6xl font-bold text-primary mb-4">eTale</div>
          <p className="text-white text-lg">Version 1.0.0</p>
          <p className="text-neutral-400 mt-2">You have the latest version.</p>
          <p className="text-neutral-500 mt-6 text-sm">
            This app will update automatically when a new version is available.
          </p>
          <p className="text-neutral-400 mt-12">© 2024 eTale. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
};

export default AppVersionPage;
