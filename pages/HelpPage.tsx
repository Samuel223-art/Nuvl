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

const HelpPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div>
      <StaticPageHeader title="Help" onBack={onBack} />
      <main className="px-4 py-6 space-y-6 text-neutral-300">
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-white mb-2">How do I add a novel to my library?</h2>
          <p>Navigate to the novel's detail page and tap the "Add to Library" button. The button will change to "In Library" to confirm it has been added.</p>
        </div>
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-white mb-2">How can I read offline?</h2>
          <p>On a novel's detail page, tap the three-dot menu and select "Download". Once downloaded, the novel will be available in the "Downloads" tab on the "My novels" page, even without an internet connection.</p>
        </div>
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-white mb-2">I found a novel I don't like. How can I stop seeing it?</h2>
          <p>On a novel's detail page, tap the three-dot menu and select "Remove from Top Picks for You". We will hide this novel from your recommendations for a while.</p>
        </div>
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-white mb-2">Contact Support</h2>
          <p>If you need further assistance, please email our support team at <a href="mailto:support@etale.example.com" className="text-primary hover:underline">support@etale.example.com</a>.</p>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;
