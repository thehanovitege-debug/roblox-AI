const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🧠 プレイヤーごとの記憶
const history = {};
const MAX_HISTORY = 10; // 直近10発言まで記憶

function getHistory(player) {
  if (!history[player]) {
    history[player] = [
      {
        role: "system",
        content:
          "あなたは明るいギャル系NPCです。語尾は「〜だよ！」「〜じゃん！」など軽いノリで返事します。短く元気に話します。"
      }
    ];
  }
  return history[player];
}

// ★ チャット
app.post("/chat", async (req, res) => {
  const player = req.body.player || "Player";
  const message = req.body.message || "";

  try {
    const messages = getHistory(player);

    // ユーザー発言追加
    messages.push({
      role: "user",
      content: `${player}：「${message}」`
    });

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      max_tokens: 80
    });

    const reply = completion.choices[0].message.content;

    // AI返答も記憶
    messages.push({
      role: "assistant",
      content: reply
    });

    // 古い記憶を削る（system以外）
    if (messages.length > MAX_HISTORY * 2) {
      history[player] = [
        messages[0],
        ...messages.slice(-MAX_HISTORY * 2)
      ];
    }

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Groq API error" });
  }
});

app.listen(3000, () => {
  console.log("Groq NPC サーバー起動 → http://localhost:3000");
});


