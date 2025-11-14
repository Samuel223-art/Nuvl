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


const PrivacyPolicyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div>
      <StaticPageHeader title="Privacy Policy" onBack={onBack} />
      <main className="px-4 py-6 prose prose-invert max-w-none text-neutral-300">
        <h2>1. Introduction</h2>
        <p>Welcome to eTale. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>

        <h2>2. Information We Collect</h2>
        <p>We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, when you participate in activities on the app or otherwise when you contact us.</p>
        <p>The personal information that we collect depends on the context of your interactions with us and the app, the choices you make and the products and features you use. The personal information we collect may include the following: email, username, and password.</p>

        <h2>3. How We Use Your Information</h2>
        <p>We use personal information collected via our app for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>

        <h2>4. Will Your Information Be Shared With Anyone?</h2>
        <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>

        <h2>5. How Long Do We Keep Your Information?</h2>
        <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.</p>

        <h2>6. How Do We Keep Your Information Safe?</h2>
        <p>We aim to protect your personal information through a system of organizational and technical security measures.</p>
        
        <h2>7. Contact Us</h2>
        <p>If you have questions or comments about this policy, you may email us at privacy@etale.example.com.</p>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
