"use client";

import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Scoreboard from "@/components/Scoreboard";
import asteroidImageSrc from "@/assets/images/Asteroid.png";
import bulletImageSrc from "@/assets/images/Bullet.png";
import spaceshipImageSrc from "@/assets/images/Spaceship.png";
import ufoImageSrc from "@/assets/images/UFO.png";

class GameObject {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  speed: number;

  constructor(x: number, y: number, radius: number, speed: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = 0;
    this.dy = 0;
    this.speed = speed;
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }
}

class Spaceship extends GameObject {
  angle: number;
  scale: number;

  constructor(x: number, y: number, speed: number, scale: number = 1) {
    super(x, y, 30 * scale, speed); // Increased radius from 20 to 30
    this.angle = -Math.PI / 2; // Start facing upwards
    this.scale = scale;
  }

  rotate(angle: number) {
    this.angle += angle;
  }
}

class Target extends GameObject {
  scale: number;
  type: "asteroid" | "ufo";

  constructor(
    x: number,
    y: number,
    speed: number,
    scale: number,
    type: "asteroid" | "ufo"
  ) {
    // Slightly reduce the size for UFOs
    super(x, y, type === "asteroid" ? Math.random() * 30 + 20 : 25, speed);
    const angle = Math.random() * Math.PI * 2;
    this.dx = Math.cos(angle) * this.speed;
    this.dy = Math.sin(angle) * this.speed;
    this.scale = scale;
    this.type = type;
  }
}

class Laser extends GameObject {
  constructor(x: number, y: number, angle: number, speed: number) {
    super(x, y, 3, speed);
    this.dx = Math.cos(angle) * this.speed;
    this.dy = Math.sin(angle) * this.speed;
  }
}

export default function EnhancedAsteroidGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    let spaceship = new Spaceship(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 3, 1.5); // Increased scale from 1 to 1.5
    let targets: Target[] = [];
    let lasers: Laser[] = [];

    // Create initial targets
    for (let i = 0; i < 5; i++) {
      targets.push(
        new Target(
          Math.random() * CANVAS_WIDTH,
          Math.random() * CANVAS_HEIGHT,
          2,
          1,
          Math.random() < 0.5 ? "asteroid" : "ufo"
        )
      );
    }

    // Pre-load images
    const spaceshipImg = new window.Image();
    spaceshipImg.src = spaceshipImageSrc;
    const asteroidImg = new window.Image();
    asteroidImg.src = asteroidImageSrc;
    const bulletImg = new window.Image();
    bulletImg.src = bulletImageSrc;
    const ufoImg = new window.Image();
    ufoImg.src = ufoImageSrc;

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
        const laserSpeed = 8; // Increased from 5 to 8
        const laserDistance = spaceship.radius + 5; // Increased distance
        const laser = new Laser(
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
        spaceship.rotate(-0.1);
      }
      if (keys["ArrowRight"]) {
        spaceship.rotate(0.1);
      }
      if (keys["ArrowUp"]) {
        spaceship.dx += Math.cos(spaceship.angle) * 0.1;
        spaceship.dy += Math.sin(spaceship.angle) * 0.1;
      }
      spaceship.move();

      // Keep spaceship on screen
      spaceship.x = (spaceship.x + CANVAS_WIDTH) % CANVAS_WIDTH;
      spaceship.y = (spaceship.y + CANVAS_HEIGHT) % CANVAS_HEIGHT;
    }

    function createTarget() {
      const safeDistance = 350; // Increased from 250 to 350
      let x = 0,
        y = 0;
      let isValidPosition = false;

      while (!isValidPosition) {
        const side = Math.floor(Math.random() * 4);
        switch (side) {
          case 0: // top
            x = Math.random() * CANVAS_WIDTH;
            y = -50; // Increased from -30 to -50
            break;
          case 1: // right
            x = CANVAS_WIDTH + 50; // Increased from +30 to +50
            y = Math.random() * CANVAS_HEIGHT;
            break;
          case 2: // bottom
            x = Math.random() * CANVAS_WIDTH;
            y = CANVAS_HEIGHT + 50; // Increased from +30 to +50
            break;
          case 3: // left
            x = -50; // Increased from -30 to -50
            y = Math.random() * CANVAS_HEIGHT;
            break;
        }

        // Check if the position is far enough from the spaceship
        const distanceToSpaceship = Math.hypot(
          x - spaceship.x,
          y - spaceship.y
        );
        if (distanceToSpaceship > safeDistance) {
          isValidPosition = true;
        }
      }

      // Slightly reduce the scale for UFOs
      const scale = Math.random() < 0.5 ? 1.5 : 1; // 50% chance of larger targets
      const type = Math.random() < 0.5 ? "asteroid" : "ufo";
      return new Target(x, y, 2, type === "ufo" ? scale * 1.25 : scale, type);
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

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      updateSpaceship();

      // Draw spaceship
      ctx.save();
      ctx.translate(spaceship.x, spaceship.y);
      ctx.rotate(spaceship.angle + Math.PI / 2);
      ctx.drawImage(
        spaceshipImg,
        -spaceship.radius,
        -spaceship.radius,
        spaceship.radius * 2,
        spaceship.radius * 2
      );
      ctx.restore();

      // Update and draw targets
      for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        target.move();
        const img = target.type === "asteroid" ? asteroidImg : ufoImg;
        const drawRadius =
          target.type === "ufo" ? target.radius * 1.25 : target.radius;
        ctx.drawImage(
          img,
          target.x - drawRadius,
          target.y - drawRadius,
          drawRadius * 2,
          drawRadius * 2
        );

        // Remove targets that are off-screen
        if (
          target.x < -50 ||
          target.x > CANVAS_WIDTH + 50 ||
          target.y < -50 ||
          target.y > CANVAS_HEIGHT + 50
        ) {
          targets.splice(i, 1);
        }
      }

      // Add new targets if needed, with a delay
      if (targets.length < 5 && Math.random() < 0.02) {
        // 2% chance each frame
        targets.push(createTarget());
      }

      // Update and draw lasers
      for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.move();
        ctx.fillStyle = "yellow"; // Changed from using an image to a simple yellow circle
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2);
        ctx.fill();

        // Remove lasers that are off-screen
        if (
          laser.x < 0 ||
          laser.x > CANVAS_WIDTH ||
          laser.y < 0 ||
          laser.y > CANVAS_HEIGHT
        ) {
          lasers.splice(i, 1);
        }
      }

      checkCollisions();

      requestAnimationFrame(gameLoop);
    }

    // Start the game loop once images are loaded
    Promise.all([
      new Promise((resolve) => (spaceshipImg.onload = resolve)),
      new Promise((resolve) => (asteroidImg.onload = resolve)),
      new Promise((resolve) => (bulletImg.onload = resolve)),
      new Promise((resolve) => (ufoImg.onload = resolve)),
    ]).then(() => {
      gameLoop();
    });

    // Add window resize event listener
    function handleResize() {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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
    <div className="h-screen w-screen overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" />
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
