"use client";

import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

// Import SVG content as strings
const tankSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="25" y="40" width="50" height="30" fill="#4a4a4a"/>
  <rect x="10" y="70" width="80" height="15" fill="#4a4a4a"/>
  <rect x="45" y="20" width="10" height="30" fill="#4a4a4a"/>
  <circle cx="50" cy="55" r="15" fill="#6a6a6a"/>
</svg>`;

const asteroidSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 10 L70 30 L90 50 L70 70 L50 90 L30 70 L10 50 L30 30 Z" fill="#8B4513"/>
  <circle cx="40" cy="40" r="8" fill="#A0522D"/>
  <circle cx="60" cy="60" r="6" fill="#A0522D"/>
</svg>`;

const bulletSvg = `<svg viewBox="0 0 20 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 0 L20 40 L0 40 Z" fill="#ff0000"/>
</svg>`;

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
    super(x, y, 20 * scale, speed);
    this.angle = -Math.PI / 2; // Start facing upwards
    this.scale = scale;
  }

  rotate(angle: number) {
    this.angle += angle;
  }
}

class Asteroid extends GameObject {
  scale: number;

  constructor(x: number, y: number, speed: number, scale: number) {
    super(x, y, Math.random() * 20 + 10, speed);
    const angle = Math.random() * Math.PI * 2;
    this.dx = Math.cos(angle) * this.speed;
    this.dy = Math.sin(angle) * this.speed;
    this.scale = scale;
  }
}

class Laser extends GameObject {
  scale: number;

  constructor(
    x: number,
    y: number,
    angle: number,
    speed: number,
    scale: number
  ) {
    super(x, y, 5, speed);
    this.dx = Math.cos(angle) * this.speed;
    this.dy = Math.sin(angle) * this.speed;
    this.scale = scale;
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

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    let spaceship = new Spaceship(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 3, 1);
    let asteroids: Asteroid[] = [];
    let lasers: Laser[] = [];

    // Create initial asteroids
    for (let i = 0; i < 5; i++) {
      asteroids.push(
        new Asteroid(
          Math.random() * CANVAS_WIDTH,
          Math.random() * CANVAS_HEIGHT,
          2,
          1
        )
      );
    }

    // Pre-load images
    const tankImg = new Image();
    tankImg.src = `data:image/svg+xml;base64,${btoa(tankSvg)}`;
    const asteroidImg = new Image();
    asteroidImg.src = `data:image/svg+xml;base64,${btoa(asteroidSvg)}`;
    const bulletImg = new Image();
    bulletImg.src = `data:image/svg+xml;base64,${btoa(bulletSvg)}`;

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
        const laserSpeed = 5;
        const laserDistance = spaceship.radius; // Distance from center to front of spaceship
        const laser = new Laser(
          spaceship.x + Math.cos(angle) * laserDistance,
          spaceship.y + Math.sin(angle) * laserDistance,
          angle,
          laserSpeed,
          0.5
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

    function createAsteroid() {
      const safeDistance = 100; // Minimum distance from spaceship
      let x = 0,
        y = 0;
      let isValidPosition = false;

      while (!isValidPosition) {
        const side = Math.floor(Math.random() * 4);
        switch (side) {
          case 0: // top
            x = Math.random() * CANVAS_WIDTH;
            y = -30;
            break;
          case 1: // right
            x = CANVAS_WIDTH + 30;
            y = Math.random() * CANVAS_HEIGHT;
            break;
          case 2: // bottom
            x = Math.random() * CANVAS_WIDTH;
            y = CANVAS_HEIGHT + 30;
            break;
          case 3: // left
            x = -30;
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

      return new Asteroid(x, y, 2, 1);
    }

    function checkCollisions() {
      // Check laser-asteroid collisions
      for (let i = lasers.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
          if (
            Math.hypot(
              lasers[i].x - asteroids[j].x,
              lasers[i].y - asteroids[j].y
            ) <
            lasers[i].radius + asteroids[j].radius
          ) {
            // Collision detected
            lasers.splice(i, 1);
            asteroids.splice(j, 1);
            scoreRef.current += 10;
            setScore(scoreRef.current);
            break;
          }
        }
      }

      // Check spaceship-asteroid collisions
      for (let i = asteroids.length - 1; i >= 0; i--) {
        if (
          Math.hypot(
            spaceship.x - asteroids[i].x,
            spaceship.y - asteroids[i].y
          ) <
          spaceship.radius + asteroids[i].radius
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
      ctx.rotate(spaceship.angle + Math.PI / 2); // Adjust rotation to match SVG orientation
      ctx.drawImage(
        tankImg,
        -spaceship.radius,
        -spaceship.radius,
        spaceship.radius * 2,
        spaceship.radius * 2
      );
      ctx.restore();

      // Update and draw asteroids
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.move();
        ctx.drawImage(
          asteroidImg,
          asteroid.x - asteroid.radius,
          asteroid.y - asteroid.radius,
          asteroid.radius * 2,
          asteroid.radius * 2
        );

        // Remove asteroids that are off-screen
        if (
          asteroid.x < -50 ||
          asteroid.x > CANVAS_WIDTH + 50 ||
          asteroid.y < -50 ||
          asteroid.y > CANVAS_HEIGHT + 50
        ) {
          asteroids.splice(i, 1);
        }
      }

      // Add new asteroids if needed
      while (asteroids.length < 5) {
        asteroids.push(createAsteroid());
      }

      // Update and draw lasers
      for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.move();
        ctx.drawImage(
          bulletImg,
          laser.x - laser.radius,
          laser.y - laser.radius,
          laser.radius * 2,
          laser.radius * 2
        );

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
      new Promise((resolve) => (tankImg.onload = resolve)),
      new Promise((resolve) => (asteroidImg.onload = resolve)),
      new Promise((resolve) => (bulletImg.onload = resolve)),
    ]).then(() => {
      gameLoop();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <h1 className="mb-4 text-4xl font-bold">Space Defender</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="rounded-lg border-4 border-gray-700 shadow-lg"
      />
      <div className="mt-4 flex w-full max-w-md justify-between">
        <div className="text-xl">Score: {score}</div>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        Use arrow keys to move and rotate, spacebar to shoot
      </div>
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold">Game Over</h2>
            <p className="mb-4 text-2xl">Final Score: {score}</p>
            <Button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
