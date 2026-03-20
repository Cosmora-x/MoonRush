import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory leaderboard
let leaderboard: { name: string; score: number }[] = [
  { name: "Neil A.", score: 5000 },
  { name: "Buzz A.", score: 4500 },
  { name: "Sally R.", score: 4000 },
  { name: "Yuri G.", score: 3500 },
  { name: "Valentina T.", score: 3000 },
];

app.get("/api/leaderboard", (req, res) => {
  res.json(leaderboard);
});

app.post("/api/leaderboard", (req, res) => {
  const { name, score } = req.body;
  if (name && typeof score === 'number') {
    leaderboard.push({ name: name.substring(0, 15), score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); // Keep top 10
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid data" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
