import React from "react";

const BulletSVG: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 20 40" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M10 0 L20 40 L0 40 Z" fill="#ff0000" />
  </svg>
);

export default BulletSVG;
