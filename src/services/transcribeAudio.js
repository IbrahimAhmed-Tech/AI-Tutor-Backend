const { OpenAI } = require("openai"); 
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const transcribeAudio = async (audioBuffer ,originalName = "audio.webm") => {
    const ext = path.extname(originalName) || ".webm";
    const tmpFilePath = `/tmp/${uuidv4()}${ext}`; // ✅ Use /tmp/ directory for Vercel

    // ✅ Write buffer to temp file
    fs.writeFileSync(tmpFilePath, audioBuffer);

    // ✅ Create readable stream from that file
    const stream = fs.createReadStream(tmpFilePath);

    const result = await openai.audio.transcriptions.create({
        file: stream,
        model: "whisper-1",
        language: "en",
    });

    // ✅ Clean up
    fs.unlinkSync(tmpFilePath);

    return result;
};
module.exports = { transcribeAudio};
