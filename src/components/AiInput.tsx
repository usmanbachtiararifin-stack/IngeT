"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface JadwalItem {
  title: string;
  start: string;
  end: string;
  desc?: string;
}

export default function AiInput({ onAdd }: { onAdd: (item: JadwalItem) => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!input.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/mengobrol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses jadwal");
      }

      if (data.title) {
        onAdd(data as JadwalItem);
        setInput("");
      } else {
        alert("Waduh, ingeT tidak mengembalikan jadwal yang valid.");
      }
    } catch (error) {
      alert("Waduh, ingeT lagi bingung. Coba lagi ya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur">
      <div className="flex items-center gap-3 rounded-xl bg-slate-950/80 px-3 py-2">
        <Sparkles className="h-5 w-5 text-cyan-300" />
        <input
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleProcess()}
          placeholder="Contoh: meeting dengan tim besok jam 10"
        />
        <button
          className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
          onClick={handleProcess}
          disabled={loading}
        >
          {loading ? "..." : "Tambah"}
        </button>
      </div>
    </div>
  );
}
