import React from 'react';

export default function ADVTop({ imageUrl = 'https://placehold.co/970x90/2563eb/fff?text=TOP+AD', linkUrl = 'https://www.bet365.it/?_h=ic8Nmqr5PEN7aT11Zs2SRg%3D%3D&btsffd=1#/HO/', alt = 'Top Banner Ad' }) {
  return (
    <div className="w-full bg-transparent flex justify-center items-center py-2 hidden lg:flex">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer">
        <img src={imageUrl} alt={alt} className="w-[970px] h-[90px] object-cover rounded-lg shadow" />
      </a>
    </div>
  );
} 