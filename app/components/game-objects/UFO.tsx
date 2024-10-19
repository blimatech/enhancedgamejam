import React from "react";

type UFOProps = {
  x: number;
  y: number;
};

const UFO: React.FC<UFOProps> = ({ x, y }) => {
  return (
    <div
      className="absolute h-10 w-10 rounded-full bg-purple-500"
      style={{ left: x, top: y }}
    />
  );
};

export default UFO;
