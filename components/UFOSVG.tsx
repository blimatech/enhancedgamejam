import React from "react";

const UFOSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* UFO Body */}
    <ellipse cx="50" cy="50" rx="40" ry="15" fill="#808080" />

    {/* UFO Dome */}
    <path
      d="M30 50 Q50 20 70 50"
      fill="#a0a0a0"
      stroke="#606060"
      strokeWidth="2"
    />

    {/* UFO Lights */}
    <circle cx="35" cy="50" r="3" fill="#ffff00" />
    <circle cx="50" cy="50" r="3" fill="#00ff00" />
    <circle cx="65" cy="50" r="3" fill="#ff00ff" />

    {/* UFO Beam */}
    <path d="M40 65 L30 85 L70 85 L60 65" fill="rgba(255, 255, 255, 0.3)" />
  </svg>
);

export default UFOSVG;
