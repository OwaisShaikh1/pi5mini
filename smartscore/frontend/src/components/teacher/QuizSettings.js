import React from "react";

export default function QuizSettings({ settings = { title: "", duration: 30 }, setSettings }) {
  return (
    <div className="mb-4 p-4 border rounded">
      <label className="block mb-2 font-semibold">Quiz Title</label>
      <input
        type="text"
        value={settings?.title || ""}
        onChange={(e) => setSettings?.({ ...settings, title: e.target.value })}
        className="border p-2 w-full rounded"
      />
      <label className="block mt-2 font-semibold">Duration (minutes)</label>
      <input
        type="number"
        value={settings?.duration || 30}
        onChange={(e) => setSettings?.({ ...settings, duration: e.target.value })}
        className="border p-2 w-full rounded"
      />
    </div>
  );
}
