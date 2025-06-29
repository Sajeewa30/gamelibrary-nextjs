'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

const YearPage = () => {
  const params = useParams();
  const year = params?.year as string;

  const [games, setGames] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!year) return;

    const fetchGamesByYear = async () => {
      try {
        const res = await fetch(`http://localhost:8080/admin/games/byYear/${year}`);
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error("Failed to fetch games", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGamesByYear();
  }, [year]);

  if (loading) return <p className="text-white text-center">Loading games...</p>;

  return (
    <div>
      <div className="w-[90%] mb-4 mx-auto text-center pt-[50px] pb-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/-background.JPG')] bg-cover bg-center">
        <h1 className="text-white font-bold text-8xl">{year}</h1>
      </div>

      <div className="w-[90%] mx-auto text-center pt-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/background.JPG')] bg-cover bg-center">
        <div className="mt-[1%] flex flex-row justify-center flex-wrap">
          {games.length === 0 ? (
            <p className="text-white text-xl">No games found for {year}</p>
          ) : (
            games.map((game, index) => (
              <Game
                key={index}
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

export default YearPage;
