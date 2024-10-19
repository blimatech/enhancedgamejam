import React, { useEffect, useRef } from "react";

import Image from "next/image";
import asteroidImageSrc from "@/assets/images/Asteroid.png";

type AsteroidProps = {
  size?: "small" | "medium" | "large";
  speed?: "slow" | "medium" | "fast";
  playSound?: boolean;
  soundSrc?: string;
  style?: React.CSSProperties;
};

const sizeMap = {
  small: 30,
  medium: 50,
  large: 70,
};

const speedMap = {
  slow: 1,
  medium: 2,
  fast: 3,
};

export const Asteroid: React.FC<AsteroidProps> = ({
  size = "medium",
  speed = "medium",
  playSound = false,
  soundSrc = "/sounds/asteroid.mp3",
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
        src={asteroidImageSrc}
        alt="Asteroid"
        width={sizeMap[size]}
        height={sizeMap[size]}
        style={{
          animation: `rotate ${60 / speedMap[speed]}s linear infinite`,
        }}
      />
    </div>
  );
};
