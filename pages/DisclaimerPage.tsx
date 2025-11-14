
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


const DisclaimerPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div>
      <StaticPageHeader title="Disclaimer" onBack={onBack} />
      <main className="px-4 py-6 prose prose-invert max-w-none text-neutral-300">
        <h2>Content Disclaimer</h2>
        <p>
          The stories, characters, and incidents portrayed in this application are fictitious. No identification with actual persons (living or deceased), places, buildings, and products is intended or should be inferred.
        </p>
        <p>
          The views and opinions expressed in the stories are those of the authors and do not necessarily reflect the official policy or position of eTale or its developers. The content provided is for entertainment purposes only.
        </p>
        <p>
          Some content may not be suitable for all audiences. Reader discretion is advised.
        </p>
      </main>
    </div>
  );
};

export default DisclaimerPage;
