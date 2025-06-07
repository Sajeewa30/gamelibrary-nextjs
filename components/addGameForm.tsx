const addGameForm = () => {

    const webUrl:String = "http://localhost:8080";

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const handleSubmit = async(event:any) => {
        event.preventDefault();
        
    const data = {
        name: String(event.target.name.value),
        year: Number(event.target.year.value),
        completedYear: Number(event.target.completedYear.value),
        isCompleted: Boolean(event.target.isCompleted.checked),
        isHundredPercent: Boolean(event.target.isHundredPercent.checked),
        isFavourite: Boolean(event.target.isFavourite.checked),
        specialDescription: String(event.target.specialDescription.value),
        }

        await fetch(webUrl + "/admin/addGameItem",{
            method: 'POST',
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        }).then((response) => response.json()).then(data => {
            console.log(data);
        })
        }

        return(
            <div className="flex justify-center">
        <form onSubmit={handleSubmit}>

            <h1>Fill This To Add a New Game</h1><br/>

            <label>Name : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm text-black" type="text" autoComplete="off" id="name" required minLength={1} maxLength={40}  /><br/><br/>

            <label>Year : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm text-black text-center" type="number" autoComplete="off" id="year" required defaultValue={currentYear} min={1975} /><br/><br/>

            <label>Completed Year/Played year : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm text-black text-center" type="number" autoComplete="off" id="completedYear" defaultValue={currentYear} required min={1975} /><br/><br/>

            <label>Is It Completed? : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="checkbox" id="isCompleted" name="isCompleted"/><br/><br/>

            <label>Is It 100% Completed? : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm " type="checkbox" id="isHundredPercent" name="isHundredPercent"/><br/><br/>

            <label>Is It One of your Faourites? : </label>
            <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="checkbox" id="isFavourite" name="isFavourite"/><br/><br/>

            <label>Special Description : </label> 
            <input className="bg-amber-50 rounded-b-md rounded-t-sm text-black" type="text" autoComplete="off" id="specialDescription" minLength={0} maxLength={40}  /><br/><br/>

            <label>Add image Here :</label>
            <div></div><br/>

            <button className="bg-amber-950 p-2 rounded-md" type="submit">Submit</button>

        </form>
      </div>
        );
}


export default addGameForm;