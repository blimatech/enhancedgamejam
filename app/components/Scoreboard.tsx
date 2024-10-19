import React from "react";

type ScoreboardProps = {
  score: number;
  timer: string;
  level: number;
};

const Scoreboard: React.FC<ScoreboardProps> = ({ score, timer, level }) => {
  return (
    <div className="absolute top-0 left-0 p-4 text-white">
      <p className="text-2xl">Score: {score}</p>
      <p className="text-2xl">Time: {timer}</p>
      <p className="text-2xl">Level: {level}</p>
    </div>
  );
};

export default Scoreboard;
