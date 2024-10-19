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
import React, { useEffect, useRef, useState } from "react";

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

    // Create initial targets
    for (let i = 0; i < 5; i++) {
      const newTarget = createNewTarget(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        safeDistance,
        gameStateRef.current.spaceship.x,
        gameStateRef.current.spaceship.y
      );
      gameStateRef.current.targets.push(newTarget);
    }

    // Pre-load images
    const images: { [key: string]: HTMLImageElement } = {};
    const imageSources = {
      spaceship: "/images/Spaceship.png",
      asteroid: "/images/Asteroid.png",
      ufo: "/images/UFO.png",
      background: "/images/background.jpg",
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

    function handleKeyDown(e: KeyboardEvent) {
      gameStateRef.current.keys[e.key] = true;
    }

    function handleKeyUp(e: KeyboardEvent) {
      gameStateRef.current.keys[e.key] = false;
      if (e.key === " " && !gameOver) {
        // Shoot laser
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
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function updateSpaceship() {
      const { spaceship, keys } = gameStateRef.current;
      let updatedSpaceship = { ...spaceship };

      if (keys["ArrowLeft"]) {
        updatedSpaceship = rotateSpaceship(updatedSpaceship, -0.1);
      }
      if (keys["ArrowRight"]) {
        updatedSpaceship = rotateSpaceship(updatedSpaceship, 0.1);
      }
      if (keys["ArrowUp"]) {
        updatedSpaceship.dx += Math.cos(updatedSpaceship.angle) * 0.1;
        updatedSpaceship.dy += Math.sin(updatedSpaceship.angle) * 0.1;
      }
      updatedSpaceship = moveGameObject(updatedSpaceship) as Spaceship;

      // Keep spaceship on screen
      updatedSpaceship.x = (updatedSpaceship.x + CANVAS_WIDTH) % CANVAS_WIDTH;
      updatedSpaceship.y = (updatedSpaceship.y + CANVAS_HEIGHT) % CANVAS_HEIGHT;

      gameStateRef.current.spaceship = updatedSpaceship;
    }

    function checkCollisions() {
      const { spaceship, targets, lasers } = gameStateRef.current;
      // Check laser-target collisions
      for (let i = lasers.length - 1; i >= 0; i--) {
        for (let j = targets.length - 1; j >= 0; j--) {
          if (
            Math.hypot(lasers[i].x - targets[j].x, lasers[i].y - targets[j].y) <
            lasers[i].radius + targets[j].radius
          ) {
            // Collision detected
            lasers.splice(i, 1);
            targets.splice(j, 1);
            setScore((prevScore) => prevScore + 10);
            break;
          }
        }
      }

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
      if (images.background) {
        ctx.drawImage(images.background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      updateSpaceship();

      // Draw spaceship
      if (images.spaceship) {
        const { spaceship } = gameStateRef.current;
        ctx.save();
        ctx.translate(spaceship.x, spaceship.y);
        ctx.rotate(spaceship.angle + Math.PI / 2);
        ctx.drawImage(
          images.spaceship,
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
          const img = target.type === "asteroid" ? images.asteroid : images.ufo;
          if (img) {
            ctx.drawImage(
              img,
              target.x - target.radius,
              target.y - target.radius,
              target.radius * 2,
              target.radius * 2
            );
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

      // Add new targets if needed, with a delay
      if (gameStateRef.current.targets.length < 5 && Math.random() < 0.02) {
        const newTarget = createNewTarget(
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          safeDistance,
          gameStateRef.current.spaceship.x,
          gameStateRef.current.spaceship.y
        );
        gameStateRef.current.targets.push(newTarget);
      }

      // Update and draw lasers
      gameStateRef.current.lasers = gameStateRef.current.lasers
        .map((laser) => {
          laser = moveGameObject(laser);
          ctx.fillStyle = "yellow";
          ctx.beginPath();
          ctx.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2);
          ctx.fill();
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      key="game-container"
      className="h-screen w-screen overflow-hidden bg-black"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {!canvasRef.current && (
        <div className="text-white">Canvas not available</div>
      )}
      <Scoreboard score={score} />
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center">
            <h2 className="mb-4 text-6xl font-bold text-white">Game Over</h2>
            <p className="mb-4 text-4xl text-yellow-400">
              Final Score: {score}
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
