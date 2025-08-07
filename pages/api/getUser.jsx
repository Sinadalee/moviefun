// pages/api/getUser.js
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    // user.favoriteMovies = user.favoriteMovie.split(",");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "User not found." });
  }
}
