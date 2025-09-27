"use client";
import { useState, useEffect } from 'react';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        onClick={scrollToTop}
        className="button"
        aria-label="Back to top"
      >
        <svg className="svgIcon" viewBox="0 0 384 512">
          <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
        </svg>
      </button>
      
      <style jsx>{`
        .button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgb(20, 20, 20);
          border: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 0px 0px 4px rgba(180, 160, 255, 0.253);
          cursor: pointer;
          transition-duration: 0.3s;
          overflow: hidden;
          position: relative;
        }

        .svgIcon {
          width: 12px;
          transition-duration: 0.3s;
        }

        .svgIcon path {
          fill: white;
        }

        .button:hover {
          width: 140px;
          border-radius: 50px;
          transition-duration: 0.3s;
          background-color: rgb(181, 160, 255);
          align-items: center;
        }

        .button:hover .svgIcon {
          transition-duration: 0.3s;
          transform: translateY(-200%);
        }

        .button::before {
          position: absolute;
          bottom: -20px;
          content: "Back to Top";
          color: white;
          font-size: 0px;
        }

        .button:hover::before {
          font-size: 13px;
          opacity: 1;
          bottom: unset;
          transition-duration: 0.3s;
        }
      `}</style>
    </div>
  );
}
