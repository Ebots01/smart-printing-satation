// backend/index.js

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// === CONFIG ===
const TOKEN = "8395060598:AAFXcRw_XvkB9EYDNCtuIvmmhH4TJEg8Lfk";  // Replace with real BotFather token
const PORT = 3000;
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// In-memory "DB"
let pinToFileMap = {};

// === TELEGRAM BOT ===
const bot = new TelegramBot(TOKEN, { polling: true });

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function saveFile(fileId, originalName, mimeType, chatId) {
  try {
    const file = await bot.getFile(fileId);
    const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

    const pin = generatePin();
    const ext = path.extname(originalName) || "";
    const newFileName = `${pin}${ext}`;
    const filePath = path.join(uploadDir, newFileName);

    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    pinToFileMap[pin] = {
        filename: newFileName,
        originalName: originalName,
        mimeType: mimeType
    };

    bot.sendMessage(chatId, `✅ File saved!\nYour PIN is: *${pin}*`, { parse_mode: "Markdown" });
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Error saving file");
  }
}

bot.on("document", async (msg) => {
  const chatId = msg.chat.id;
  await saveFile(msg.document.file_id, msg.document.file_name, msg.document.mime_type, chatId);
});

bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  const photo = msg.photo[msg.photo.length - 1];
  await saveFile(photo.file_id, `photo_${Date.now()}.jpg`, 'image/jpeg', chatId);
});

// === EXPRESS BACKEND ===
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// New endpoint to get file info and serve the file
app.get("/file/:pin", (req, res) => {
  const { pin } = req.params;

  if (pinToFileMap[pin]) {
    const fileData = pinToFileMap[pin];
    const filePath = path.join(uploadDir, fileData.filename);

    if (fs.existsSync(filePath)) {
        return res.json({
            success: true,
            name: fileData.originalName,
            type: fileData.mimeType,
            url: `http://localhost:${PORT}/files/${fileData.filename}`
        });
    }
  }

  return res.status(404).json({ success: false, message: "Invalid PIN or file not found" });
});

app.use("/files", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});