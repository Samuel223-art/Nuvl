import React from 'react';

interface WalletPageProps {
  onNavigateBack: () => void;
  coins: number;
}

interface CoinPackage {
  coins: number;
  bonus?: string;
  price: string;
  bestValue?: boolean;
}

const coinPackages: CoinPackage[] = [
  { coins: 100, price: '$0.99' },
  { coins: 550, bonus: '+ 50 Bonus', price: '$4.99' },
  { coins: 1200, bonus: '+ 200 Bonus', price: '$9.99', bestValue: true },
  { coins: 2500, bonus: '+ 500 Bonus', price: '$19.99' },
  { coins: 6500, bonus: '+ 1500 Bonus', price: '$49.99' },
  { coins: 14000, bonus: '+ 4000 Bonus', price: '$99.99' },
];

const CoinPackageCard: React.FC<CoinPackage> = ({ coins, bonus, price, bestValue }) => (
  <div className={`relative bg-neutral-800 rounded-lg p-4 text-center border-2 transition-all duration-300 hover:border-primary hover:scale-105 cursor-pointer ${bestValue ? 'border-primary' : 'border-transparent'}`}>
    {bestValue && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</div>}
    <div className="flex items-center justify-center">
      <i className="fas fa-coins text-yellow-400 text-2xl mr-2"></i>
      <span className="text-2xl font-bold text-white">{coins.toLocaleString()}</span>
    </div>
    {bonus && <p className="text-sm text-primary font-semibold mt-1">{bonus}</p>}
    <div className="mt-4 bg-neutral-700 text-white font-bold py-2 px-4 rounded-lg">
      {price}
    </div>
  </div>
);

interface Transaction {
    id: number;
    description: string;
    date: string;
    amount: string;
    isPurchase: boolean;
}

const transactionHistory: Transaction[] = [
    { id: 1, description: 'Purchased Coins', date: '2024-07-28', amount: '+ 1,200', isPurchase: true },
    { id: 2, description: 'Unlocked "THE GREATEST ESTATE DEVELOPER" Ch. 45', date: '2024-07-28', amount: '- 5', isPurchase: false },
    { id: 3, description: 'Unlocked "OMNISCIENT READER" Ch. 32', date: '2024-07-27', amount: '- 5', isPurchase: false },
    { id: 4, description: 'Daily Check-in Bonus', date: '2024-07-27', amount: '+ 1', isPurchase: true },
];

const TransactionItem: React.FC<Transaction> = ({ description, date, amount, isPurchase }) => (
    <div className="flex justify-between items-center py-3 border-b border-neutral-800">
        <div>
            <p className="text-white font-medium">{description}</p>
            <p className="text-neutral-400 text-sm">{date}</p>
        </div>
        <div className={`font-bold text-lg ${isPurchase ? 'text-primary' : 'text-white'}`}>
            {amount}
        </div>
    </div>
);


const WalletPage: React.FC<WalletPageProps> = ({ onNavigateBack, coins }) => {
  return (
    <div className="px-4">
      {/* Header */}
      <header className="relative flex items-center justify-center py-4">
        <button onClick={onNavigateBack} className="absolute left-0 text-white" aria-label="Go back">
          <i className="fas fa-chevron-left text-2xl"></i>
        </button>
        <h1 className="text-xl font-bold text-white">My Wallet</h1>
      </header>
      
      <div className="space-y-10 mt-4">
        {/* Current Balance */}
        <section className="bg-neutral-800 rounded-lg p-6 text-center">
          <p className="text-neutral-400 text-sm font-medium">CURRENT BALANCE</p>
          <div className="flex items-center justify-center mt-2">
            <i className="fas fa-coins text-yellow-400 text-4xl mr-3"></i>
            <span className="text-5xl font-bold text-white">{coins.toLocaleString()}</span>
          </div>
        </section>

        {/* Buy Coins */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Buy Coins</h2>
          <div className="grid grid-cols-2 gap-4">
            {coinPackages.map((pkg) => (
              <CoinPackageCard key={pkg.coins} {...pkg} />
            ))}
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Transaction History</h2>
           <div>
            {transactionHistory.map(tx => <TransactionItem key={tx.id} {...tx} />)}
           </div>
           <div className="text-center mt-4">
                <button className="text-primary font-semibold hover:text-green-400">View All</button>
           </div>
        </section>
      </div>
    </div>
  );
};

export default WalletPage;
