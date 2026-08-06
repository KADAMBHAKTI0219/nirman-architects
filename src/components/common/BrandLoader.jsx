import React from 'react';
import faviconImg from '../../assets/images/favicon.png';

export default function BrandLoader({ text = "Loading Nirman Alliance...", fullScreen = false, size = "md" }) {
  const sizeClasses = 
    size === "sm" ? "w-8 h-8" :
    size === "lg" ? "w-16 h-16" : "w-12 h-12";

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3.5 animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing halo */}
        <div className="absolute inset-0 rounded-full bg-brand-primary/50 blur-md animate-pulse scale-125"></div>
        
        {/* Spinning brand favicon logo */}
        <img
          src={faviconImg}
          alt="Nirman Architects"
          className={`${sizeClasses} animate-spin duration-700 ease-linear relative z-10 drop-shadow-md`}
        />
      </div>

      {text && (
        <span className="text-xs font-black text-slate-800 uppercase tracking-widest animate-pulse font-sans">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-xs z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
