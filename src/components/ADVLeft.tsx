import React from 'react';

export default function ADVLeft({ imageUrl = 'https://placehold.co/160x600/2563eb/fff?text=AD', linkUrl = 'https://www.linkedin.com/feed/', alt = 'Left Vertical Ad' }) {
  return (
    <div className="hidden lg:block fixed left-0 top-0 h-screen z-50 flex items-center">
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center h-full">
        <div>
          <img src={imageUrl} alt={alt} className="h-full w-[210px] object-cover" />
        </div>
      </a>
    </div>
  );
} 