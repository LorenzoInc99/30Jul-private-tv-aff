import React from 'react';

export default function ADVRight({ imageUrl = 'https://placehold.co/160x600/FFA500/fff?text=AD', linkUrl = 'https://www.bet365.it/?_h=ic8Nmqr5PEN7aT11Zs2SRg%3D%3D&btsffd=1#/HO/', alt = 'Right Vertical Ad' }) {
  return (
    <div className="hidden lg:block fixed right-0 top-16 w-[210px] z-40">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img src={imageUrl} alt={alt} className="w-full h-auto object-cover" />
      </a>
    </div>
  );
} 