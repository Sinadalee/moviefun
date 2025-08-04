// pages/api/fact.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { movie } = req.query;

  if (!movie) return res.status(400).json({ error: "Movie not provided" });

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Give me a fun, lesser-known fact about the movie "${movie}". Keep it brief.`,
        },
      ],
    });

    const fact = completion.data.choices[0].message.content;
    res.status(200).json({ fact });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate fun fact." });
  }
}
