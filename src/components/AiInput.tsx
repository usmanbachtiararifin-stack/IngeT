"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Sparkles } from "lucide-react";

interface JadwalItem {
  title: string;
  start: string;
  end: string;
  desc?: string;
}

export default function AiInput({ onAdd }: { onAdd: (item: JadwalItem) => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const mulaiBicara = () => {
    const SpeechRecognitionCtor =
      (window as Window & {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      }).SpeechRecognition ||
      (window as Window & {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert("Browser kamu tidak mendukung fitur suara.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const hasilSuara = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (hasilSuara) {
        setInput(hasilSuara);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      alert("Suara tidak terdengar, coba lagi.");
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const hentikanBicara = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

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
        <button
          type="button"
          className={`rounded-lg p-2 ${isListening ? "bg-red-500 text-white" : "bg-cyan-400 text-slate-950"}`}
          onClick={isListening ? hentikanBicara : mulaiBicara}
          aria-label={isListening ? "Berhenti mendengarkan" : "Mulai mendengarkan"}
          disabled={loading}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
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
