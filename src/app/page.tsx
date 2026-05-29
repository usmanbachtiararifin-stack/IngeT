"use client";

import { useEffect, useState } from "react";
import AiInput from "@/components/AiInput";

interface JadwalItem {
  title: string;
  start: string;
  end: string;
  desc?: string;
  sudahDiingatkan?: boolean;
}

const temaWarna = {
  blue: {
    eyebrow: "text-blue-200",
    panelGradient: "from-blue-500/20",
    badge: "bg-blue-500/20 text-blue-100",
    title: "text-blue-200",
    dot: "bg-blue-600",
  },
  purple: {
    eyebrow: "text-purple-200",
    panelGradient: "from-purple-500/20",
    badge: "bg-purple-500/20 text-purple-100",
    title: "text-purple-200",
    dot: "bg-purple-600",
  },
  pink: {
    eyebrow: "text-pink-200",
    panelGradient: "from-pink-500/20",
    badge: "bg-pink-500/20 text-pink-100",
    title: "text-pink-200",
    dot: "bg-pink-600",
  },
  green: {
    eyebrow: "text-emerald-200",
    panelGradient: "from-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-100",
    title: "text-emerald-200",
    dot: "bg-emerald-600",
  },
} as const;

const pilihanWarna = [
  { name: "Blue", key: "blue" },
  { name: "Purple", key: "purple" },
  { name: "Pink", key: "pink" },
  { name: "Green", key: "green" },
] as const;

export default function Home() {
  const [jadwals, setJadwals] = useState<JadwalItem[]>([]);
  const [aksenWarna, setAksenWarna] = useState<keyof typeof temaWarna>("blue");

  const temaAktif = temaWarna[aksenWarna];

  const bersuara = (teks: string) => {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(teks);
    speech.lang = "id-ID";
    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    const saved = localStorage.getItem("jadwal_inget");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as JadwalItem[];
        setJadwals(parsed);
      } catch (error) {
        console.error("Gagal memuat jadwal dari localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jadwal_inget", JSON.stringify(jadwals));
  }, [jadwals]);

  useEffect(() => {
    const interval = setInterval(() => {
      const sekarang = new Date().toLocaleString("id-ID", {
        minute: "2-digit",
        hour: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });

      setJadwals((current) =>
        current.map((j) => {
          const waktuJadwal = new Date(j.start).toLocaleString("id-ID", {
            minute: "2-digit",
            hour: "2-digit",
            day: "2-digit",
            month: "2-digit",
          });

          if (sekarang === waktuJadwal && !j.sudahDiingatkan) {
            bersuara(`Halo! Saatnya ${j.title}. Jangan lupa ya!`);
            return { ...j, sudahDiingatkan: true };
          }

          return j;
        }),
      );
    }, 1000 * 30);

    return () => clearInterval(interval);
  }, [jadwals]);

  const tambahJadwal = (item: JadwalItem) => {
    setJadwals((current) => [...current, { ...item, sudahDiingatkan: false }]);
    bersuara(`Siap! Sudah saya masukkan jadwal ${item.title}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <section className={`rounded-3xl border border-white/10 bg-gradient-to-br ${temaAktif.panelGradient} to-slate-900 p-6 shadow-xl shadow-cyan-950/20`}>
          <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${temaAktif.eyebrow}`}>ingeT</p>
          <h1 className="mt-3 text-4xl font-bold">Asisten jadwal pintarmu</h1>
          <p className="mt-2 text-sm text-slate-300">
            Ceritakan jadwalmu, dan ingeT akan menuliskannya dalam format kalender.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Tema
            </span>
            <div className="flex items-center gap-2" aria-label="Pilih warna tema">
              {pilihanWarna.map((warna) => (
                <button
                  key={warna.key}
                  type="button"
                  onClick={() => setAksenWarna(warna.key)}
                  className={`h-6 w-6 rounded-full ${temaWarna[warna.key].dot} border-2 ${aksenWarna === warna.key ? "border-white" : "border-transparent"}`}
                  aria-label={`Pilih tema ${warna.name}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <AiInput onAdd={tambahJadwal} />
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Jadwal Mendatang</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${temaAktif.badge}`}>
              {jadwals.length} item
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {jadwals.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-300">
                Belum ada jadwal. Yuk ketik sesuatu!
              </p>
            )}

            {jadwals.map((j, i) => (
              <article key={`${j.title}-${i}`} className="rounded-2xl bg-slate-900/90 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${temaAktif.title}`}>{j.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {new Date(j.start).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${temaAktif.badge}`}>
                    aktif
                  </span>
                </div>
                {j.desc && <p className="mt-3 text-sm text-slate-200">{j.desc}</p>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
