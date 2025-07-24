import React from 'react';

export default function ADVRight({ imageUrl = 'https://placehold.co/160x600/FFA500/fff?text=AD', linkUrl = 'https://www.bet365.it/?_h=ic8Nmqr5PEN7aT11Zs2SRg%3D%3D&btsffd=1#/HO/', alt = 'Right Vertical Ad' }) {
  return (
    <div className="hidden lg:block fixed right-0 top-0 h-screen z-50 ml-4 flex items-center">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center h-full">
        <img src={imageUrl} alt={alt} className="h-full w-[160px] object-cover" />
      </a>
    </div>
  );
} 