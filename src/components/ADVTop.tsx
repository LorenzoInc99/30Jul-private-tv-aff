import React from 'react';

export default function ADVTop({ imageUrl = 'https://placehold.co/970x90/2563eb/fff?text=TOP+AD', linkUrl = 'https://www.bet365.it/?_h=ic8Nmqr5PEN7aT11Zs2SRg%3D%3D&btsffd=1#/HO/', alt = 'Top Banner Ad' }) {
  return (
    <div className="w-full bg-transparent flex justify-center items-center hidden lg:flex">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="w-full">
        <div className="w-full">
          <img src={imageUrl} alt={alt} className="w-full h-[90px] object-cover rounded-lg shadow" />
        </div>
      </a>
    </div>
  );
} 