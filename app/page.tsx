'use client'
import Link from "next/link";

export default function Home() {

  const webUrl:String = "http://localhost:8080";

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const handleSubmit = (event:any) => {
    event.preventDefault();
  
  const data = {
    name: String(event.target.name.value),
    year: Number(event.target.year.value),
    completedYear: Number(event.target.completedYear.value),
    isCompleted: Boolean(event.target.isCompleted.value),
    isHundredPercent: Boolean(event.target.isHundredPercent.value),
    isFavourite: Boolean(event.target.isFavourite.value),
    specialDescription: String(event.target.specialDescription.value),
  }

  }

  return (
    <div>

      <Link href="/Favourites">Click to see Favourite Games</Link><br/>
      <Link href="/FullyCompleted">Click to see 100% Completed Games</Link><br/>
      <Link href="/2025" >Click to see Games Completed in 2025</Link><br/>
      <Link href="/2024">Click to see Games Completed in 2024</Link><br/>

      <div className="flex justify-center">
        <form onSubmit={handleSubmit}>

            <h1>Fill This To Add a New Game</h1><br/>

            <label>Name : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="text" autoComplete="off" id="name" required minLength={1} maxLength={40}  /><br/><br/>

            <label>Year : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="number" autoComplete="off" id="year" required defaultValue={currentYear} min={1975}  /><br/><br/>

            <label>Completed Year/Played year : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="number" autoComplete="off" id="completedYear" defaultValue={currentYear} required min={1975} /><br/><br/>

            <label>Is It Completed? : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="checkbox" id="isCompleted"/><br/><br/>

            <label>Is It 100% Completed? : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="checkbox" id="isHundredPercent"/><br/><br/>

            <label>Is It One of your Faourites? : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="checkbox" id="isFavourite"/><br/><br/>

            <label>Special Description : </label> 
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="text" autoComplete="off" id="specialDescription" minLength={0} maxLength={40}  /><br/><br/>

            <label>Add image Here :</label>
            <div></div><br/>

            <button className="bg-amber-950 p-2 rounded-md" type="submit">Submit</button>

        </form>
      </div>
    </div>
  );
}
