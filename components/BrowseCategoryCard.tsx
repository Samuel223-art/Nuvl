import React from 'react';

interface BrowseCategoryCardProps {
  title: string;
  images: string[];
}

const BrowseCategoryCard: React.FC<BrowseCategoryCardProps> = ({ title, images }) => {
  return (
    <div className="bg-neutral-800 rounded-lg p-4 flex flex-col justify-between aspect-[3/2] cursor-pointer group transform transition-transform duration-300 hover:scale-105">
      <h3 className="text-white font-bold text-lg">{title}</h3>
      <div className="relative h-24 w-full flex justify-end items-end">
        {images.slice(0, 3).reverse().map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`${title} collage image ${index + 1}`}
            className="absolute w-16 h-20 object-cover rounded-md shadow-lg border-2 border-neutral-700"
            style={{
              zIndex: index,
              right: `${index * 20}px`,
              transform: `rotate(${index * 5 - 5}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowseCategoryCard;
