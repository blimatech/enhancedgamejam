import React from "react";

const AsteroidSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M50 10 L70 30 L90 50 L70 70 L50 90 L30 70 L10 50 L30 30 Z"
      fill="#8B4513"
    />
    <circle cx="40" cy="40" r="8" fill="#A0522D" />
    <circle cx="60" cy="60" r="6" fill="#A0522D" />
  </svg>
);

export default AsteroidSVG;
