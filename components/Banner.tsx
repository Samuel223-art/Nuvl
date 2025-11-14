import React from 'react';

const Banner: React.FC = () => {
  return (
    <section 
      className="bg-neutral-800 rounded-lg p-6 flex items-center justify-between overflow-hidden relative"
      aria-labelledby="banner-heading"
    >
      <div className="z-10">
        <h2 id="banner-heading" className="text-2xl font-bold text-white mb-2">
          Unlock All Stories
        </h2>
        <p className="text-neutral-300 mb-4 text-sm sm:text-base">
          Get unlimited access to our entire library.
        </p>
        <button className="bg-primary text-black font-bold py-2 px-5 rounded-full hover:bg-green-400 transition-colors duration-300 text-sm">
          Go Premium
        </button>
      </div>
      <div className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-center sm:w-auto sm:relative sm:right-auto sm:top-auto">
        <i className="fas fa-crown text-7xl text-primary/20 transform -rotate-12 sm:text-8xl"></i>
      </div>
    </section>
  );
};

export default Banner;
