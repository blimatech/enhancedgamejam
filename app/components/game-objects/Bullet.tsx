import React, { useEffect, useRef } from "react";

type BulletProps = {
  size?: "small" | "medium" | "large";
  speed?: "slow" | "medium" | "fast";
  playSound?: boolean;
  soundSrc?: string;
  style?: React.CSSProperties;
};

const sizeMap = {
  small: 2,
  medium: 3,
  large: 4,
};

const speedMap = {
  slow: 5,
  medium: 8,
  fast: 12,
};

export const Bullet: React.FC<BulletProps> = ({
  size = "medium",
  speed = "fast",
  playSound = false,
  soundSrc = "/sounds/bullet.mp3",
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
    <div
      style={{
        ...style,
        width: `${sizeMap[size]}px`,
        height: `${sizeMap[size]}px`,
        borderRadius: "50%",
        backgroundColor: "yellow",
        animation: `move ${60 / speedMap[speed]}s linear infinite`,
      }}
    />
  );
};
