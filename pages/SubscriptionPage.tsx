import React, { useState } from 'react';

interface SubscriptionPageProps {
  onNavigateBack: () => void;
}

const BenefitItem: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center">
      <i className={`fas ${icon} text-primary text-xl`}></i>
    </div>
    <div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-neutral-400">{description}</p>
    </div>
  </div>
);

// FIX: Define a type for the plan details to make optional properties explicit.
// This resolves TypeScript errors when accessing properties that only exist on some plans.
interface PlanDetails {
  price: string;
  period: string;
  yearlyPrice?: string;
  savings?: string;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onNavigateBack }) => {
  const [selectedPlan, setSelectedPlan] = useState('Annually');

  const benefits = [
    { icon: 'fa-infinity', title: 'Unlimited Access', description: 'Read every story in our massive library without limits.' },
    { icon: 'fa-rectangle-ad', title: 'Ad-Free Reading', description: 'Enjoy an uninterrupted, immersive reading experience.' },
    { icon: 'fa-download', title: 'Offline Downloads', description: 'Save your favorite series to read anytime, anywhere.' },
    { icon: 'fa-star', title: 'Exclusive Content', description: 'Get early access to new releases and subscriber-only series.' },
  ];

  const plans: { [key: string]: PlanDetails } = {
    Monthly: { price: '$9.99', period: '/month' },
    Annually: { price: '$5.83', period: '/month', yearlyPrice: '$69.99/year', savings: 'Save 41%' },
  };


  return (
    <div className="px-4 pb-16">
      {/* Header */}
      <header className="relative flex items-center justify-center py-4">
        <button onClick={onNavigateBack} className="absolute left-0 text-white" aria-label="Go back">
          <i className="fas fa-chevron-left text-2xl"></i>
        </button>
        <h1 className="text-xl font-bold text-white">eTale Premium</h1>
      </header>

      <div className="mt-4 space-y-10">
        <section className="text-center p-6 bg-gradient-to-br from-primary/20 to-neutral-900 rounded-lg">
           <i className="fas fa-crown text-5xl text-primary mb-4"></i>
           <h2 className="text-3xl font-extrabold text-white">Unlock Everything</h2>
           <p className="text-neutral-300 mt-2">Join Premium to get the ultimate eTale experience.</p>
        </section>

        <section className="space-y-6">
            {benefits.map(benefit => <BenefitItem key={benefit.title} {...benefit} />)}
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4 text-center">Choose Your Plan</h2>
          <div className="flex flex-col space-y-4">
            {Object.entries(plans).map(([name, details]) => (
                <button
                    key={name}
                    onClick={() => setSelectedPlan(name)}
                    className={`relative w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${selectedPlan === name ? 'border-primary bg-primary/10' : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'}`}
                >
                    {details.savings && <div className="absolute top-0 -translate-y-1/2 left-4 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">{details.savings}</div>}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">{name}</h3>
                            {details.yearlyPrice && <p className="text-sm text-neutral-400">{details.yearlyPrice}</p>}
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-bold text-white">{details.price}<span className="text-base font-medium text-neutral-400">{details.period}</span></p>
                        </div>
                    </div>
                </button>
            ))}
          </div>
        </section>
      </div>

       <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800">
         <button className="w-full py-3 bg-primary text-black text-lg font-bold rounded-lg hover:bg-green-400 transition-colors">
            Subscribe Now
         </button>
       </div>

    </div>
  );
};

export default SubscriptionPage;
