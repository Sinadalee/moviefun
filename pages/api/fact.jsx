// pages/api/fact.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    const { movie } = req.query;
    if (!movie) return res.status(400).json({ error: "Movie not provided" });
    if (!process.env.OPENAI_API_KEY)
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini", // use any available chat model
      messages: [
        {
          role: "user",
          content: `Give one short, lesser-known fun fact about the movie "${movie}". Keep it to 1-2 sentences.`,
        },
      ],
      temperature: 0.8,
    });

    const fact =
      resp.choices?.[0]?.message?.content?.trim() || "No fact found.";
    res.status(200).json({ fact });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to generate fun fact" });
  }
}
