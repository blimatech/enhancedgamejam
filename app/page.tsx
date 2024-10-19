"use client";

import {
  Laser,
  Spaceship,
  Target,
  createLaser,
  createNewTarget,
  createSpaceship,
  moveGameObject,
  rotateSpaceship,
} from "@/app/utils/gameUtils";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/app/components/ui/button";
import Scoreboard from "@/app/components/Scoreboard";

export default function EnhancedAsteroidGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameStateRef = useRef({
    spaceship: {} as Spaceship,
    targets: [] as Target[],
    lasers: [] as Laser[],
    keys: {} as { [key: string]: boolean },
  });
  const laserSoundRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [level, setLevel] = useState(1);

  // Create a memoized function to get the current image based on level
  const getCurrentImage = useCallback(
    (type: string) => {
      const asteroidImages = [
        "/images/Asteroid1.png",
        "/images/Asteroid2.png",
        "/images/Asteroid3.png",
        "/images/Asteroid4.png", // Use Asteroid4 for level 4
      ];
      const ufoImages = [
        "/images/UFO1.png",
        "/images/UFO2.png",
        "/images/UFO3.png",
        "/images/UFO4.png", // New UFO4 image
      ];
      const backgroundImages = [
        "/images/background1.jpg",
        "/images/background2.jpg",
        "/images/background3.jpg",
        "/images/background4.jpg", // New background4 image
      ];
      const starshipImages = [
        "/images/spaceship1.png",
        "/images/spaceship2.png",
        "/images/spaceship3.png",
        "/images/spaceship4.png", // New spaceship4 image
      ];
      const bulletImages = [
        "/images/bullet1.png",
        "/images/bullet2.png",
        "/images/bullet3.png",
        "/images/bullet4.png", // New bullet4 image
      ];

      switch (type) {
        case "asteroid":
          return asteroidImages[Math.min(level - 1, asteroidImages.length - 1)];
        case "ufo":
          return ufoImages[Math.min(level - 1, ufoImages.length - 1)];
        case "background":
          return backgroundImages[
            Math.min(level - 1, backgroundImages.length - 1)
          ];
        case "starship":
          return starshipImages[Math.min(level - 1, starshipImages.length - 1)];
        case "bullet":
          return bulletImages[Math.min(level - 1, bulletImages.length - 1)];
        default:
          return "";
      }
    },
    [level]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let CANVAS_WIDTH = canvas.width;
    let CANVAS_HEIGHT = canvas.height;

    let safeDistance = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.2;

    gameStateRef.current.spaceship = createSpaceship(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      3,
      1.5
    );

    // Modify the createNewTarget function to account for level 4
    const createLevelAdjustedTarget = (
      canvasWidth: number,
      canvasHeight: number,
      safeDistance: number,
      spaceshipX: number,
      spaceshipY: number,
      currentLevel: number
    ) => {
      const target = createNewTarget(
        canvasWidth,
        canvasHeight,
        safeDistance,
        spaceshipX,
        spaceshipY,
        currentLevel
      );

      // Set fixed size for level 4
      if (currentLevel === 4) {
        target.radius = 35; // Same fixed size for both asteroid and UFO
      }

      return target;
    };

    // Use the new function when creating initial targets
    for (let i = 0; i < 3; i++) {
      const newTarget = createLevelAdjustedTarget(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        safeDistance,
        gameStateRef.current.spaceship.x,
        gameStateRef.current.spaceship.y,
        level
      );
      gameStateRef.current.targets.push(newTarget);
    }

    // Pre-load images
    const images: { [key: string]: HTMLImageElement } = {};
    const imageSources = {
      spaceship1: "/images/spaceship1.png",
      spaceship2: "/images/spaceship2.png",
      spaceship3: "/images/spaceship3.png",
      spaceship4: "/images/spaceship4.png", // New spaceship4 image
      asteroid1: "/images/Asteroid1.png",
      asteroid2: "/images/Asteroid2.png",
      asteroid3: "/images/Asteroid3.png",
      asteroid4: "/images/Asteroid4.png",
      ufo1: "/images/UFO1.png",
      ufo2: "/images/UFO2.png",
      ufo3: "/images/UFO3.png",
      ufo4: "/images/UFO4.png", // New UFO4 image
      background1: "/images/background1.jpg",
      background2: "/images/background2.jpg",
      background3: "/images/background3.jpg",
      background4: "/images/background4.jpg", // New background4 image
      bullet1: "/images/bullet1.png",
      bullet2: "/images/bullet2.png",
      bullet3: "/images/bullet3.png",
      bullet4: "/images/bullet4.png", // New bullet4 image
    };

    const loadImage = (key: string, src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          images[key] = img;
          console.log(`Image loaded: ${key}`);
          resolve();
        };
        img.onerror = (error) => {
          console.error(`Error loading image ${key}:`, error);
          reject(error);
        };
        img.src = src;
      });
    };

    // Initialize laser sound
    laserSoundRef.current = new Audio("/sounds/LaserShootMusic.mp3");

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore 'M' key in the game loop
      if (e.key !== "m" && e.key !== "M") {
        gameStateRef.current.keys[e.key] = true;
      }

      // Shoot laser on spacebar press
      if (e.key === " " && !gameOver) {
        shootLaser();
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      // Ignore 'M' key in the game loop
      if (e.key !== "m" && e.key !== "M") {
        gameStateRef.current.keys[e.key] = false;
      }
    }

    function shootLaser() {
      const { spaceship } = gameStateRef.current;
      const angle = spaceship.angle;
      const laserSpeed = 8;
      const laserDistance = spaceship.radius + 5;
      const laser = createLaser(
        spaceship.x + Math.cos(angle) * laserDistance,
        spaceship.y + Math.sin(angle) * laserDistance,
        angle,
        laserSpeed
      );
      gameStateRef.current.lasers.push(laser);

      // Play laser sound only if not muted
      if (laserSoundRef.current && !isMuted) {
        laserSoundRef.current.currentTime = 0; // Reset the audio to the beginning
        laserSoundRef.current
          .play()
          .catch((error) => console.error("Error playing laser sound:", error));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Add event listener for mute toggle
    const handleMuteToggle = (event: CustomEvent) => {
      setIsMuted(event.detail.isMuted);
      if (laserSoundRef.current) {
        laserSoundRef.current.muted = event.detail.isMuted;
      }
    };

    window.addEventListener(
      "soundMuteToggle",
      handleMuteToggle as EventListener
    );

    function updateSpaceship() {
      const { spaceship, keys } = gameStateRef.current;
      let updatedSpaceship = { ...spaceship };

      if (keys["ArrowLeft"]) {
        updatedSpaceship = rotateSpaceship(updatedSpaceship, -0.05);
      }
      if (keys["ArrowRight"]) {
        updatedSpaceship = rotateSpaceship(updatedSpaceship, 0.05);
      }
      // Remove the code for ArrowUp key

      updatedSpaceship = moveGameObject(updatedSpaceship) as Spaceship;

      // Keep spaceship on screen
      updatedSpaceship.x = (updatedSpaceship.x + CANVAS_WIDTH) % CANVAS_WIDTH;
      updatedSpaceship.y = (updatedSpaceship.y + CANVAS_HEIGHT) % CANVAS_HEIGHT;

      gameStateRef.current.spaceship = updatedSpaceship;
    }

    function checkCollisions() {
      const { spaceship, targets, lasers } = gameStateRef.current;
      const newTargets: Target[] = [];

      // Check laser-target collisions
      for (let i = lasers.length - 1; i >= 0; i--) {
        for (let j = targets.length - 1; j >= 0; j--) {
          if (
            Math.hypot(lasers[i].x - targets[j].x, lasers[i].y - targets[j].y) <
            lasers[i].radius + targets[j].radius
          ) {
            // Collision detected
            lasers.splice(i, 1);

            if (targets[j].type === "asteroid" && targets[j].radius > 15) {
              // Split asteroid into two smaller ones
              for (let k = 0; k < 2; k++) {
                const newAsteroid = {
                  ...targets[j],
                  radius: targets[j].radius / 2,
                  dx: Math.random() * 2 - 1,
                  dy: Math.random() * 2 - 1,
                };
                newTargets.push(newAsteroid);
              }
            }

            targets.splice(j, 1);
            setScore((prevScore) => prevScore + 10);
            break;
          }
        }
      }

      // Add new smaller asteroids
      gameStateRef.current.targets = [...targets, ...newTargets];

      // Check spaceship-target collisions
      for (let i = targets.length - 1; i >= 0; i--) {
        if (
          Math.hypot(spaceship.x - targets[i].x, spaceship.y - targets[i].y) <
          spaceship.radius + targets[i].radius
        ) {
          // Game over
          setGameOver(true);
        }
      }
    }

    function gameLoop() {
      if (!ctx || gameOver) return;

      // Clear the canvas before redrawing
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background
      const backgroundImage = images[`background${level}`];
      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      updateSpaceship();

      // Draw spaceship
      const spaceshipImage = images[`spaceship${level}`];
      if (spaceshipImage) {
        const { spaceship } = gameStateRef.current;
        ctx.save();
        ctx.translate(spaceship.x, spaceship.y);
        ctx.rotate(spaceship.angle + Math.PI / 2);
        ctx.drawImage(
          spaceshipImage,
          -spaceship.radius,
          -spaceship.radius,
          spaceship.radius * 2,
          spaceship.radius * 2
        );
        ctx.restore();
      }

      // Update and draw targets
      gameStateRef.current.targets = gameStateRef.current.targets
        .map((target) => {
          target = moveGameObject(target) as Target;
          let imgKey;
          if (level === 4) {
            imgKey = `${target.type}4`; // Use asteroid4 and ufo4 for level 4
          } else {
            imgKey = `${target.type}${level}`;
          }
          const img = images[imgKey];
          if (img) {
            let size;
            if (level === 4) {
              size = 70; // Same fixed size for both asteroid and UFO in level 4
            } else {
              size = target.radius * 2;
            }
            ctx.drawImage(
              img,
              target.x - size / 2,
              target.y - size / 2,
              size,
              size
            );
          } else {
            // Fallback to drawing a circle if image is not available
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            ctx.fillStyle = target.type === "asteroid" ? "gray" : "green";
            ctx.fill();
          }
          return target;
        })
        .filter((target) => {
          // Remove targets that are off-screen
          return !(
            target.x < -50 ||
            target.x > CANVAS_WIDTH + 50 ||
            target.y < -50 ||
            target.y > CANVAS_HEIGHT + 50
          );
        });

      // Reduce the rate of adding new targets
      if (gameStateRef.current.targets.length < 3 && Math.random() < 0.01) {
        const newTarget = createLevelAdjustedTarget(
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          safeDistance,
          gameStateRef.current.spaceship.x,
          gameStateRef.current.spaceship.y,
          level
        );
        gameStateRef.current.targets.push(newTarget);
      }

      // Update and draw lasers
      gameStateRef.current.lasers = gameStateRef.current.lasers
        .map((laser) => {
          laser = moveGameObject(laser);
          const bulletImage = images[`bullet${level}`];
          if (bulletImage) {
            ctx.save();
            ctx.translate(laser.x, laser.y);
            ctx.rotate(Math.atan2(laser.dy, laser.dx) + Math.PI / 2); // Rotated by 90 degrees
            ctx.drawImage(
              bulletImage,
              -laser.radius * 3, // Tripled the size
              -laser.radius * 3, // Tripled the size
              laser.radius * 6, // Tripled the size
              laser.radius * 6 // Tripled the size
            );
            ctx.restore();
          } else {
            // Fallback to drawing a circle if image is not available
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(laser.x, laser.y, laser.radius * 3, 0, Math.PI * 2); // Tripled the radius
            ctx.fill();
          }
          return laser;
        })
        .filter((laser) => {
          // Remove lasers that are off-screen
          return !(
            laser.x < 0 ||
            laser.x > CANVAS_WIDTH ||
            laser.y < 0 ||
            laser.y > CANVAS_HEIGHT
          );
        });

      checkCollisions();

      requestAnimationFrame(gameLoop);
    }

    // Load images and start the game loop
    Promise.all(
      Object.entries(imageSources).map(([key, src]) => loadImage(key, src))
    )
      .then(() => {
        console.log("All images loaded successfully");
        gameLoop();
      })
      .catch((error) => {
        console.error("Error loading images:", error);
      });

    // Add window resize event listener
    function handleResize() {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        CANVAS_WIDTH = canvas.width;
        CANVAS_HEIGHT = canvas.height;
        safeDistance = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.2;
      }
    }
    window.addEventListener("resize", handleResize);

    // Add timer logic
    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    // Add level progression based on time
    const levelInterval = setInterval(() => {
      setLevel((prevLevel) => Math.min(prevLevel + 1, 4)); // Increase max level to 4
    }, 1000); // Increase level every 5 seconds, up to level 4

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener(
        "soundMuteToggle",
        handleMuteToggle as EventListener
      );
      window.removeEventListener("resize", handleResize);
      clearInterval(timerInterval);
      clearInterval(levelInterval);
      if (laserSoundRef.current) {
        laserSoundRef.current.pause();
        laserSoundRef.current = null;
      }
    };
  }, [gameOver, isMuted, level, getCurrentImage]);

  // Helper function to format time
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="h-full w-full" />
      {!canvasRef.current && (
        <div className="text-white">Canvas not available</div>
      )}
      <div className="pointer-events-none absolute inset-0">
        <Scoreboard score={score} timer={formatTime(timer)} level={level} />
      </div>
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center">
            <h2 className="mb-4 text-6xl font-bold text-white">Game Over</h2>
            <p className="mb-4 text-4xl text-yellow-400">
              Final Score: {score}
            </p>
            <p className="mb-4 text-4xl text-yellow-400">
              Time: {formatTime(timer)}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-500 px-6 py-3 text-xl text-white transition-colors hover:bg-blue-600"
            >
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
