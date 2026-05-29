const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY   // ← ここが絶対に正しい
});

app.post("/chat", async (req, res) => {
  const { player, message } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "あなたは可愛いNPCとして短く返事します。" },
        { role: "user", content: `${player}：「${message}」` }
      ],
      max_tokens: 50
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Groq API error" });
  }
});

app.listen(3000, () => {
  console.log("Groq NPC サーバー起動 → http://localhost:3000");
});

