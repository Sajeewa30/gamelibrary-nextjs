import Link from "next/link";

export default function Home() {
  return (
    <div >
      <Link href="/Favourites">Click to see 2024 page</Link><br/>
      <Link href="/FullyCompleted">Click to see 2024 page</Link><br/>
      <Link href="/2025" >Click to see 2025 page</Link><br/>
      <Link href="/2024">Click to see 2024 page</Link><br/>
      
    </div>
  );
}
