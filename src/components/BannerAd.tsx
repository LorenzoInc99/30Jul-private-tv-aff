import React from "react";

export default function BannerAd({
  imageUrl,
  linkUrl,
  alt = "Advertisement",
  label = "Advertisement",
}: {
  imageUrl: string;
  linkUrl: string;
  alt?: string;
  label?: string;
}) {
  return (
    <div className="w-full flex flex-col items-center my-4">
      <span className="text-xs text-gray-400 mb-1">{label}</span>
      <a href={linkUrl} target="_blank" rel="noopener sponsored">
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full h-auto rounded shadow"
          style={{ maxHeight: 90 }}
        />
      </a>
    </div>
  );
} 