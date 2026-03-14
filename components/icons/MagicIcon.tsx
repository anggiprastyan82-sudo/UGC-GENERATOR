
import React from 'react';

const MagicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m19 2 2 2-2 2-2-2 2-2Z" />
    <path d="m5 6 2 2-2 2-2-2 2-2Z" />
    <path d="m15 4 2 2-2 2-2-2 2-2Z" />
    <path d="M19 14l2 2-2 2-2-2 2-2Z" />
    <path d="M4 14l2 2-2 2-2-2 2-2Z" />
    <line x1="12" y1="9" x2="3" y2="18" />
    <path d="m9 12 3 3" />
  </svg>
);

export default MagicIcon;
