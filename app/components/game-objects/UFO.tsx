import React, { useEffect, useRef } from "react";

import Image from "next/image";
import ufoImageSrc from "@/assets/images/UFO.png";

type UFOProps = {
  size?: "small" | "medium" | "large";
  speed?: "slow" | "medium" | "fast";
  playSound?: boolean;
  soundSrc?: string;
  style?: React.CSSProperties;
};

const sizeMap = {
  small: 35,
  medium: 55,
  large: 75,
};

const speedMap = {
  slow: 1,
  medium: 2,
  fast: 3,
};

export const UFO: React.FC<UFOProps> = ({
  size = "medium",
  speed = "medium",
  playSound = false,
  soundSrc = "/sounds/ufo.mp3",
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
        src={ufoImageSrc}
        alt="UFO"
        width={sizeMap[size]}
        height={sizeMap[size]}
        style={{
          animation: `hover ${30 / speedMap[speed]}s ease-in-out infinite`,
        }}
      />
    </div>
  );
};
