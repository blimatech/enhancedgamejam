import React from "react";

const TankSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="25" y="40" width="50" height="30" fill="#4a4a4a" />
    <rect x="10" y="70" width="80" height="15" fill="#4a4a4a" />
    <rect x="45" y="10" width="10" height="40" fill="#4a4a4a" />
    <circle cx="50" cy="55" r="15" fill="#6a6a6a" />
    <polygon points="40,10 60,10 50,0" fill="#ff0000" />{" "}
    {/* Larger red triangle at the top */}
  </svg>
);

export default TankSVG;
