import React from 'react';

export default function ADVLeft({ imageUrl = 'https://placehold.co/160x600/2563eb/fff?text=AD', linkUrl = 'https://www.linkedin.com/feed/', alt = 'Left Vertical Ad' }) {
  return (
    <div className="hidden lg:block fixed left-0 top-16 w-[210px] z-40">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img src={imageUrl} alt={alt} className="w-full h-auto object-cover" />
      </a>
    </div>
  );
} 