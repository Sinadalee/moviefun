// pages/api/saveFavorite.js
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, movie } = req.body;

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { favoriteMovie: movie },
    });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to save movie." });
  }
}
