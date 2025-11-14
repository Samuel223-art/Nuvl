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

const TermsOfUsePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div>
      <StaticPageHeader title="Terms of Use" onBack={onBack} />
      <main className="px-4 py-6 prose prose-invert max-w-none text-neutral-300">
        <h2>1. Agreement to Terms</h2>
        <p>By using our application, you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use the application.</p>

        <h2>2. User Accounts</h2>
        <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.</p>
        
        <h2>3. Content</h2>
        <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post on or through the service, including its legality, reliability, and appropriateness.</p>

        <h2>4. Prohibited Uses</h2>
        <p>You may not use the app for any illegal or unauthorized purpose. You agree to comply with all laws, rules, and regulations applicable to your use of the service.</p>
        
        <h2>5. Termination</h2>
        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        
        <h2>6. Changes to Terms</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Use on this page.</p>
      </main>
    </div>
  );
};

export default TermsOfUsePage;
