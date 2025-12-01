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
    <div className="group relative w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
      <div className="relative h-[360px] w-full overflow-hidden">
        {hasValidImage ? (
          <Image
            src={imageUrl}
            alt={`Image for ${name}`}
            fill
            sizes="280px"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700 text-white/60">
            No image available
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="px-4 text-center text-sm text-white/90">
            {specialDescription || "No description provided"}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex flex-col">
          <span className="text-sm text-white/60">Title</span>
          <span className="text-base font-semibold">{name}</span>
        </div>
        <span className="rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-sm font-semibold text-white/80">
          {year}
        </span>
      </div>
    </div>
  );
};

export default Game;
