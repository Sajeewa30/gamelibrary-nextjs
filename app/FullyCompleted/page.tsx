'use client';

import { useEffect, useState } from "react";
import Game from "@/components/game";

type GameType = {
  name: string;
  year: number;
  completedYear: number;
  isCompleted: boolean;
  isHundredPercent: boolean;
  isFavourite: boolean;
  specialDescription: string;
  imageUrl: string;
};

const FullyCompleted = () => {
  const [games, setGames] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHundredPercent = async () => {
      try {
        const res = await fetch("http://localhost:8080/admin/getHundredPercentCompletedGames");
        const data = await res.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching 100% completed games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHundredPercent();
  }, []);

  return (
    <div>
      <div className="w-[90%] mb-4 mx-auto text-center pt-[50px] pb-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/-background.JPG')] bg-cover bg-center">
        <h1 className='text-white font-bold text-8xl'>100% Completed</h1>
      </div>

      <div className="w-[90%] mx-auto text-center pt-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/background.JPG')] bg-cover bg-center">
        <div className="mt-[1%] flex flex-row justify-center flex-wrap">
          {loading ? (
            <p className="text-white text-xl">Loading...</p>
          ) : games.length === 0 ? (
            <p className="text-white text-xl">No 100% completed games found.</p>
          ) : (
            games.map((game, idx) => (
              <Game
                key={idx}
                name={game.name}
                year={game.year.toString()}
                imageUrl={game.imageUrl}
                specialDescription={game.specialDescription}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FullyCompleted;
