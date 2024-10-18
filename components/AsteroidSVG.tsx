import React from "react";

const AsteroidSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M50 10 L80 30 L90 60 L70 85 L40 90 L15 70 L10 40 L25 15 Z"
      fill="#8B4513"
      stroke="#A0522D"
      strokeWidth="2"
    />
    <circle cx="30" cy="30" r="5" fill="#A0522D" />
    <circle cx="70" cy="60" r="8" fill="#A0522D" />
    <circle cx="40" cy="70" r="6" fill="#A0522D" />
  </svg>
);

export default AsteroidSVG;
