"use client";

import React, { useEffect, useRef, useState } from "react";

const SoundOnIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const SoundOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

export const BackgroundMusic: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/BackgroundMusic.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5; // Adjust volume as needed

    // Try to play the audio automatically
    audioRef.current.play().catch((error) => {
      console.warn(
        "Auto-play was prevented. Please use the mute/unmute button to start the music."
      );
      setIsMuted(true);
    });

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "m" || event.key === "M") {
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((prevMuted) => {
      const newMuted = !prevMuted;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      // Dispatch a custom event to notify other components about the mute state change
      window.dispatchEvent(
        new CustomEvent("soundMuteToggle", { detail: { isMuted: newMuted } })
      );
      return newMuted;
    });
  };

  return (
    <button
      onClick={toggleMute}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        padding: "10px",
        background: "rgba(0, 0, 0, 0.5)",
        color: "white",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        width: "48px",
        height: "48px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isMuted ? <SoundOnIcon /> : <SoundOffIcon />}
    </button>
  );
};
