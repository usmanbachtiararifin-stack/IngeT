import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("JSON tidak ditemukan dalam respons");
  }

  return candidate.slice(start, end + 1).trim();
}

function validatePayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Respons bukan objek JSON");
  }

  const data = payload as Record<string, unknown>;
  const requiredFields = ["title", "start", "end", "desc"];

  for (const field of requiredFields) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      throw new Error(`Field wajib hilang: ${field}`);
    }
  }

  return data;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY belum diatur" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json().catch(() => null);

    if (!body || typeof body.prompt !== "string" || body.prompt.trim() === "") {
      return NextResponse.json({ error: "Prompt tidak valid" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      Kamu adalah AI pengatur jadwal bernama "ingeT".
      Tugasmu: Ubah teks user menjadi JSON untuk jadwal kalender.
      Waktu sekarang: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}.

      Aturan:
      1. Jika user tidak menyebut tahun, gunakan tahun sekarang.
      2. Format output HARUS JSON murni seperti ini:
      {
        "title": "Judul kegiatan",
        "start": "YYYY-MM-DDTHH:mm:ss",
        "end": "YYYY-MM-DDTHH:mm:ss",
        "desc": "keterangan singkat"
      }
      3. Jangan berikan teks penjelasan, hanya JSON.
    `;

    const result = await model.generateContent([systemPrompt, body.prompt]);
    const rawText = result.response.text();
    const jsonText = extractJson(rawText);
    const parsed = JSON.parse(jsonText);
    const payload = validatePayload(parsed);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses jadwal" }, { status: 500 });
  }
}
