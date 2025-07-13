import React from 'react';

interface SimpleCubeLogoProps {
  size?: number;
  className?: string;
}

export const SimpleCubeLogo: React.FC<SimpleCubeLogoProps> = ({ 
  size = 32, 
  className = "" 
}) => {
  return (
    <div className={`${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 3D Cube Design */}
        {/* Top face */}
        <path
          d="M16 2 L28 8 L16 14 L4 8 Z"
          fill="white"
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        
        {/* Left face */}
        <path
          d="M4 8 L4 22 L16 28 L16 14 Z"
          fill="rgba(255, 255, 255, 0.8)"
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        
        {/* Right face */}
        <path
          d="M16 14 L16 28 L28 22 L28 8 Z"
          fill="rgba(255, 255, 255, 0.6)"
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        
        {/* Grid lines for cube sections */}
        {/* Vertical lines on left face */}
        <line x1="8" y1="10" x2="8" y2="24" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
        <line x1="12" y1="12" x2="12" y2="26" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
        
        {/* Horizontal lines on left face */}
        <line x1="4" y1="13" x2="16" y2="19" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
        <line x1="4" y1="17.5" x2="16" y2="23.5" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
        
        {/* Vertical lines on right face */}
        <line x1="20" y1="12" x2="20" y2="26" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
        <line x1="24" y1="10" x2="24" y2="24" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
        
        {/* Horizontal lines on right face */}
        <line x1="16" y1="19" x2="28" y2="13" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
        <line x1="16" y1="23.5" x2="28" y2="17.5" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
        
        {/* Top face grid */}
        <line x1="10" y1="5" x2="22" y2="11" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
        <line x1="6" y1="7" x2="18" y2="13" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
        <line x1="8" y1="4" x2="8" y2="12" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
        <line x1="16" y1="2" x2="16" y2="14" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
        <line x1="24" y1="4" x2="24" y2="12" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
      </svg>
    </div>
  );
};
