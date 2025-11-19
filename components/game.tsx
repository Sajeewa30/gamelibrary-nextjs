'use client';
import Image from "next/image";

type GameProps = {
  name: string;
  year: string;
  specialDescription: string;
  imageUrl: string;
};

// Helper function to validate URL
function isValidHttpUrl(str: string | null | undefined): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const Game = ({ name, year, imageUrl, specialDescription }: GameProps) => {
  const hasValidImage = isValidHttpUrl(imageUrl);

  return (
    <div className="album-col relative rounded-[10px] mb-[30px] basis-[32%]">
      <div className="relative group overflow-hidden w-[300px] h-[430px]">

        {hasValidImage ? (
          <Image
            src={imageUrl}
            alt={`Image for ${name}`}
            width={300}
            height={400}
            className="h-[400px]"
          />
        ) : (
          <div className="w-[300px] h-[400px] bg-gray-700 flex items-center justify-center text-white">
            No image available
          </div>
        )}

        <div className="layer absolute top-0 left-0 w-[300px] h-[400px] bg-transparent transition duration-500 hover:bg-[rgba(71,65,65,0.7)] hidden group-hover:flex items-center justify-center">
          <div className="text-white ml-5 mr-5 bg-transparent transition duration-500 hover:bg-[#000000]">
            {specialDescription}
          </div>
        </div>

        <h3 className="text-white">{name} ({year})</h3>
      </div>
    </div>
  );
};

export default Game;
