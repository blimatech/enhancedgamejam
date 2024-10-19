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

    let spaceship = createSpaceship(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      3,
      1.5
    );
    let targets: Target[] = [];
    let lasers: Laser[] = [];

    // Create initial targets
    for (let i = 0; i < 5; i++) {
      targets.push(
        createNewTarget(
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          safeDistance,
          spaceship.x,
          spaceship.y
        )
      );
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

    // Keyboard state
    const keys: { [key: string]: boolean } = {};

    function handleKeyDown(e: KeyboardEvent) {
      keys[e.key] = true;
    }

    function handleKeyUp(e: KeyboardEvent) {
      keys[e.key] = false;
      if (e.key === " ") {
        // Shoot laser
        const angle = spaceship.angle;
        const laserSpeed = 8;
        const laserDistance = spaceship.radius + 5;
        const laser = createLaser(
          spaceship.x + Math.cos(angle) * laserDistance,
          spaceship.y + Math.sin(angle) * laserDistance,
          angle,
          laserSpeed
        );
        lasers.push(laser);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function updateSpaceship() {
      if (keys["ArrowLeft"]) {
        spaceship = rotateSpaceship(spaceship, -0.1);
      }
      if (keys["ArrowRight"]) {
        spaceship = rotateSpaceship(spaceship, 0.1);
      }
      if (keys["ArrowUp"]) {
        spaceship.dx += Math.cos(spaceship.angle) * 0.1;
        spaceship.dy += Math.sin(spaceship.angle) * 0.1;
      }
      spaceship = moveGameObject(spaceship) as Spaceship;

      // Keep spaceship on screen
      spaceship.x = (spaceship.x + CANVAS_WIDTH) % CANVAS_WIDTH;
      spaceship.y = (spaceship.y + CANVAS_HEIGHT) % CANVAS_HEIGHT;
    }

    function checkCollisions() {
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

      console.log("Game loop running");

      // Clear the canvas before redrawing
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background
      if (images.background) {
        ctx.drawImage(images.background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        // Fallback to a solid color if the background image isn't loaded
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      updateSpaceship();

      // Draw spaceship
      if (images.spaceship) {
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
      targets = targets
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
      if (targets.length < 5 && Math.random() < 0.02) {
        const newTarget = createNewTarget(
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          safeDistance,
          spaceship.x,
          spaceship.y
        );
        targets.push(newTarget);
      }

      // Update and draw lasers
      lasers = lasers
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

      // Debug rendering
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(
        `Spaceship: (${Math.round(spaceship.x)}, ${Math.round(spaceship.y)})`,
        10,
        30
      );
      ctx.fillText(`Targets: ${targets.length}`, 10, 60);
      ctx.fillText(`Lasers: ${lasers.length}`, 10, 90);

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
