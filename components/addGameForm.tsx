'use client'

import type { FormEvent } from "react";

const AddGameForm = () => {

  const webUrl: string = "http://localhost:8080";
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    let imageUrl = "";
    const imageFile = formData.get("image") as File | null;

    if (imageFile && imageFile.size > 0) {
      const uploadData = new FormData();
      uploadData.append("image", imageFile);

      try {
        const res = await fetch(`${webUrl}/admin/uploadImage`, {
          method: "POST",
          body: uploadData,
        });

        if (res.ok) {
          imageUrl = await res.text();
        } else {
          alert("Image upload failed");
          return;
        }
      } catch (error) {
        console.error("Upload error:", error);
        return;
      }
    }

    const payload = {
      name: String(formData.get("name") ?? ""),
      year: Number(formData.get("year") ?? 0),
      completedYear: Number(formData.get("completedYear") ?? 0),
      isCompleted: formData.get("isCompleted") === "on",
      isHundredPercent: formData.get("isHundredPercent") === "on",
      isFavourite: formData.get("isFavourite") === "on",
      specialDescription: String(formData.get("specialDescription") ?? ""),
      imageUrl,
    };

    await fetch(`${webUrl}/admin/addGameItem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Game added:", data);
        alert("Game successfully added!");
      });
  };

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit}>

        <h1>Fill This To Add a New Game</h1><br />

        <label>Name : </label>
        <input className="bg-amber-50 rounded-b-md rounded-t-sm text-black" type="text" autoComplete="off" id="name" name="name" required minLength={1} maxLength={40} /><br /><br />

        <label>Year : </label>
        <input className="bg-amber-50 rounded-b-md rounded-t-sm text-black text-center" type="number" autoComplete="off" id="year" name="year" required defaultValue={currentYear} min={1975} /><br /><br />

        <label>Completed Year/Played year : </label>
        <input className="bg-amber-50 rounded-b-md rounded-t-sm text-black text-center" type="number" autoComplete="off" id="completedYear" name="completedYear" defaultValue={currentYear} required min={1975} /><br /><br />

        <label>Is It Completed? : </label>
        <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="checkbox" id="isCompleted" name="isCompleted" /><br /><br />

        <label>Is It 100% Completed? : </label>
        <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="checkbox" id="isHundredPercent" name="isHundredPercent" /><br /><br />

        <label>Is It One of your Favourites? : </label>
        <input className="bg-amber-50 rounded-b-md rounded-t-sm" type="checkbox" id="isFavourite" name="isFavourite" /><br /><br />

        <label>Special Description : </label>
        <input className="bg-amber-50 rounded-b-md rounded-t-sm text-black" type="text" autoComplete="off" id="specialDescription" name="specialDescription" minLength={0} maxLength={40} /><br /><br />

        <label>Add image Here :</label><br />
        <input className="text-white" type="file" name="image" accept="image/*" required /><br /><br />

        <button className="bg-amber-950 p-2 rounded-md text-white" type="submit">Submit</button>

      </form>
    </div>
  );
};

export default AddGameForm;
