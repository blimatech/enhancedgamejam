import React, { useEffect, useRef } from "react";

import Image from "next/image";
import spaceshipImageSrc from "@/assets/images/Spaceship.png";

type SpaceshipProps = {
  size?: "small" | "medium" | "large";
  speed?: "slow" | "medium" | "fast";
  playSound?: boolean;
  soundSrc?: string;
  style?: React.CSSProperties;
};

const sizeMap = {
  small: 40,
  medium: 60,
  large: 80,
};

const speedMap = {
  slow: 2,
  medium: 3,
  fast: 4,
};

export const Spaceship: React.FC<SpaceshipProps> = ({
  size = "medium",
  speed = "medium",
  playSound = false,
  soundSrc = "/sounds/spaceship.mp3",
  style,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (playSound) {
      audioRef.current = new Audio(soundSrc);
      audioRef.current.play();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playSound, soundSrc]);

  return (
    <div style={style}>
      <Image
        src={spaceshipImageSrc}
        alt="Spaceship"
        width={sizeMap[size]}
        height={sizeMap[size]}
        style={{
          transition: `transform ${0.5 / speedMap[speed]}s ease-out`,
        }}
      />
    </div>
  );
};
