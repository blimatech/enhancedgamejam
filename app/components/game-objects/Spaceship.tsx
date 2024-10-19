import Image from "next/image";
import React from "react";

type SpaceshipProps = {
  x: number;
  y: number;
};

export const Spaceship: React.FC<SpaceshipProps> = ({ x, y }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <Image
        src="/images/Spaceship.png"
        alt="Spaceship"
        width={50}
        height={50}
      />
    </div>
  );
};
