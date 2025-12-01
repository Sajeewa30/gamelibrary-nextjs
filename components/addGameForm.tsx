'use client'

import type { FormEvent } from "react";
import { API_BASE_URL } from "@/lib/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const AddGameForm = () => {
  const webUrl = API_BASE_URL;
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
        const res = await fetchWithAuth(`${webUrl}/admin/uploadImage`, {
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

    await fetchWithAuth(`${webUrl}/admin/addGameItem`, {
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
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">
          Fill this to add a new game
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-white/70">
          Name
          <input
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            type="text"
            autoComplete="off"
            id="name"
            name="name"
            required
            minLength={1}
            maxLength={40}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/70">
          Year
          <input
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            type="number"
            autoComplete="off"
            id="year"
            name="year"
            required
            defaultValue={currentYear}
            min={1975}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/70">
          Completed year / Played year
          <input
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            type="number"
            autoComplete="off"
            id="completedYear"
            name="completedYear"
            defaultValue={currentYear}
            required
            min={1975}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/70">
          Special description
          <input
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
            type="text"
            autoComplete="off"
            id="specialDescription"
            name="specialDescription"
            minLength={0}
            maxLength={40}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            className="h-5 w-5 rounded border-white/20 bg-black/50 text-sky-400 focus:ring-sky-400/60"
            type="checkbox"
            id="isCompleted"
            name="isCompleted"
          />
          Completed
        </label>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            className="h-5 w-5 rounded border-white/20 bg-black/50 text-emerald-400 focus:ring-emerald-400/60"
            type="checkbox"
            id="isHundredPercent"
            name="isHundredPercent"
          />
          100% Completed
        </label>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            className="h-5 w-5 rounded border-white/20 bg-black/50 text-fuchsia-400 focus:ring-fuchsia-400/60"
            type="checkbox"
            id="isFavourite"
            name="isFavourite"
          />
          Favourite
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-white/70">
        Add image
        <input
          className="w-full cursor-pointer rounded-lg border border-dashed border-white/15 bg-black/30 px-3 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-100 hover:border-sky-400/40"
          type="file"
          name="image"
          accept="image/*"
          required
        />
      </label>

      <div className="flex justify-end">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-indigo-900/40"
          type="submit"
        >
          Save game
        </button>
      </div>
    </form>
  );
};

export default AddGameForm;
