import React from "react";

type UFOProps = {
  x: number;
  y: number;
};

const UFO: React.FC<UFOProps> = ({ x, y }) => {
  return (
    <div
      className="absolute w-10 h-10 bg-purple-500 rounded-full"
      style={{ left: x, top: y }}
    />
  );
};

export default UFO;
