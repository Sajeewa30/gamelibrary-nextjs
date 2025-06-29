'use client'

import Link from "next/link";
import AddGameForm from "@/components/addGameForm";
import { useEffect, useState } from "react";

export default function Home() {

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const[year,setYear] = useState(currentYear);

    const[gameCount,setGameCount] = useState<number | null>(null); 

     useEffect(() => {

      const fullGameCount = async () => {
      const res = await fetch('http://localhost:8080/admin/fullGameCount');
      const data = await res.json();
      console.log(data);
      setGameCount(data.fullGameCount);
    };

    fullGameCount();
    
  }, []);


  return (
  <div className="min-h-screen p-4 bg-black">
      <ul className="grid grid-cols-2 gap-4 h-[80vh]">
        
        <Link href="/Favourites" className="block">
          <li className="bg-white rounded-2xl shadow-md flex items-center justify-center text-center p-6 hover:bg-blue-100 transition cursor-pointer h-full">
            <span className="text-lg font-semibold text-black">
              Click to see Favourite Games
            </span>
          </li>
        </Link>
          
        <Link href="/FullyCompleted" className="block">
          <li className="bg-white rounded-2xl shadow-md flex items-center justify-center text-center p-6 hover:bg-blue-100 transition cursor-pointer h-full">
            <span className="text-lg font-semibold text-black">
              Click to see 100% Completed Games
            </span>
          </li>
        </Link>

        <li className="bg-white rounded-2xl shadow-md flex items-center justify-center text-center p-6 hover:bg-blue-100 transition">
          <Link href={`/${year}`} className="text-lg font-semibold text-black">
            <span>
              Click here to see Games Completed in{''}
            </span>
          </Link>
          <input
              type="number"
              id="year"
              min="1975"
              className="bg-amber-50 rounded-b-md rounded-t-sm text-black text-center w-24 ml-2"
              autoComplete="off"
              value={year}
              onChange={(e:any) => setYear(e.target.value)}
          />
        </li>

        <Link href="/ToBeCompleted" className="block">
          <li className="bg-white rounded-2xl shadow-md flex items-center justify-center text-center p-6 hover:bg-blue-100 transition cursor-pointer h-full">
            <span className="text-lg font-semibold text-black">
              Click to see Games still to be Completed
            </span>
          </li>
        </Link>

      </ul>

      <div className="bg-white rounded-2xl shadow-md flex items-center justify-center text-center p-6 hover:bg-blue-100 transition mt-3">
        <h1 className="text-black">Total Games Played - {gameCount}</h1>
      </div>

      <div className="mt-6">
        <AddGameForm />
      </div>
    </div>
  );
}


