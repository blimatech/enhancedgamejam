// Define types for game objects
export type GameObject = {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  speed: number;
};

export type Spaceship = GameObject & {
  angle: number;
  scale: number;
};

export type Target = GameObject & {
  scale: number;
  type: "asteroid" | "ufo";
};

export type Laser = GameObject;

// Helper functions
export const createGameObject = (
  x: number,
  y: number,
  radius: number,
  speed: number
): GameObject => ({
  x,
  y,
  radius,
  dx: 0,
  dy: 0,
  speed,
});

export const moveGameObject = (obj: GameObject): GameObject => ({
  ...obj,
  x: obj.x + obj.dx,
  y: obj.y + obj.dy,
});

export const createSpaceship = (
  x: number,
  y: number,
  speed: number,
  scale: number = 1
): Spaceship => ({
  ...createGameObject(x, y, 30 * scale, speed),
  angle: -Math.PI / 2,
  scale,
});

export const rotateSpaceship = (
  spaceship: Spaceship,
  angle: number
): Spaceship => ({
  ...spaceship,
  angle: spaceship.angle + angle,
});

export const createTarget = (
  x: number,
  y: number,
  speed: number,
  scale: number,
  type: "asteroid" | "ufo"
): Target => {
  const radius = type === "asteroid" ? Math.random() * 30 + 20 : 25;
  const angle = Math.random() * Math.PI * 2;
  return {
    ...createGameObject(x, y, radius, speed),
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    scale,
    type,
  };
};

export const createLaser = (
  x: number,
  y: number,
  angle: number,
  speed: number
): Laser => ({
  ...createGameObject(x, y, 3, speed),
  dx: Math.cos(angle) * speed,
  dy: Math.sin(angle) * speed,
});

export const createNewTarget = (
  CANVAS_WIDTH: number,
  CANVAS_HEIGHT: number,
  safeDistance: number,
  spaceshipX: number,
  spaceshipY: number
): Target => {
  let x = 0,
    y = 0;
  let isValidPosition = false;

  while (!isValidPosition) {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: // top
        x = Math.random() * CANVAS_WIDTH;
        y = -50;
        break;
      case 1: // right
        x = CANVAS_WIDTH + 50;
        y = Math.random() * CANVAS_HEIGHT;
        break;
      case 2: // bottom
        x = Math.random() * CANVAS_WIDTH;
        y = CANVAS_HEIGHT + 50;
        break;
      case 3: // left
        x = -50;
        y = Math.random() * CANVAS_HEIGHT;
        break;
    }

    // Check if the position is far enough from the spaceship
    const distanceToSpaceship = Math.hypot(x - spaceshipX, y - spaceshipY);
    if (distanceToSpaceship > safeDistance) {
      isValidPosition = true;
    }
  }

  const scale = Math.random() < 0.5 ? 1.5 : 1;
  const type = Math.random() < 0.5 ? "asteroid" : "ufo";
  return createTarget(x, y, 2, type === "ufo" ? scale * 1.25 : scale, type);
};

import { useEffect } from "react";

export const useGameLoop = (updateFunction: () => void) => {
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      updateFunction();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateFunction]);
};

export const useKeyboardControls = (
  setSpaceshipPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = 5; // Adjust as needed
      switch (event.key) {
        case "ArrowUp":
          setSpaceshipPosition((prev) => ({ ...prev, y: prev.y - speed }));
          break;
        case "ArrowDown":
          setSpaceshipPosition((prev) => ({ ...prev, y: prev.y + speed }));
          break;
        case "ArrowLeft":
          setSpaceshipPosition((prev) => ({ ...prev, x: prev.x - speed }));
          break;
        case "ArrowRight":
          setSpaceshipPosition((prev) => ({ ...prev, x: prev.x + speed }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setSpaceshipPosition]);
};
