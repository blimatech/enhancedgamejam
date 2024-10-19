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
  ...createGameObject(x, y, 8, speed), // Increased radius from 6 to 8
  dx: Math.cos(angle) * speed,
  dy: Math.sin(angle) * speed,
});

export function createNewTarget(
  canvasWidth: number,
  canvasHeight: number,
  safeDistance: number,
  spaceshipX: number,
  spaceshipY: number,
  level: number
): Target {
  let x, y;
  do {
    x = Math.random() * canvasWidth;
    y = Math.random() * canvasHeight;
  } while (Math.hypot(x - spaceshipX, y - spaceshipY) < safeDistance);

  const angle = Math.random() * Math.PI * 2;
  const baseSpeed = 0.5 + level * 0.15; // Reduced level multiplier from 0.25 to 0.15
  const speed = baseSpeed + Math.random() * 0.5; // Further reduced random speed factor
  const type = Math.random() < 0.7 ? "asteroid" : "ufo";

  return {
    x,
    y,
    radius: type === "asteroid" ? Math.random() * 20 + 20 : 25,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    speed,
    type,
    scale: 1,
  };
}

const width = typeof window !== "undefined" ? window.innerWidth : 800;
const height = typeof window !== "undefined" ? window.innerHeight : 600;

type Position = {
  x: number;
  y: number;
};

export const generateRandomPosition = (): Position => {
  return {
    x: Math.random() * (width - 40), // Subtracting 40 to account for object size
    y: Math.random() * (height - 40),
  };
};

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
