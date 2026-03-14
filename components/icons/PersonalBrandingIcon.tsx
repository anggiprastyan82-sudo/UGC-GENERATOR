
import React from 'react';

const PersonalBrandingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m18.5 12.5 1.5 1.5-1.5 1.5" />
    <path d="m21.5 9.5 1.5 1.5-1.5 1.5" />
    <path d="m15.5 15.5 1.5 1.5-1.5 1.5" />
  </svg>
);

export default PersonalBrandingIcon;
