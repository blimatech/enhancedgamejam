import React from "react";

type AsteroidProps = {
  x: number;
  y: number;
};

const Asteroid: React.FC<AsteroidProps> = ({ x, y }) => {
  return (
    <div
      className="absolute w-8 h-8 bg-gray-600 rounded"
      style={{ left: x, top: y }}
    />
  );
};

export default Asteroid;
