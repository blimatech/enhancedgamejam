import React from "react";

type ScoreboardProps = {
  score: number;
};

const Scoreboard: React.FC<ScoreboardProps> = ({ score }) => {
  return (
    <div className="absolute left-4 top-4 rounded-lg bg-black bg-opacity-50 p-4">
      <div className="flex flex-col items-center">
        <h2 className="text-4xl font-bold text-white">Score</h2>
        <p className="text-6xl font-bold text-yellow-400">{score}</p>
      </div>
    </div>
  );
};

export default Scoreboard;
