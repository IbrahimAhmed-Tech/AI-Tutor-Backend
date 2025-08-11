const { OpenAI } = require("openai"); 
const fs = require("fs");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const transcribeAudio = async (audioBuffer, originalName = "audio.webm") => {
    console.time("Total transcription time");

    const ext = path.extname(originalName) || ".webm";
    const tmpFilePath = path.join(os.tmpdir(), `${uuidv4()}${ext}`);

    console.time("Write temp file");
    fs.writeFileSync(tmpFilePath, audioBuffer);
    console.timeEnd("Write temp file");

    console.time("Create read stream");
    const stream = fs.createReadStream(tmpFilePath);
    console.timeEnd("Create read stream");

    console.time("OpenAI transcription");
    const result = await openai.audio.transcriptions.create({
        file: stream,
        model: "whisper-1",
        language: "en",
    });
    console.timeEnd("OpenAI transcription");

    console.time("Cleanup temp file");
    fs.unlinkSync(tmpFilePath);
    console.timeEnd("Cleanup temp file");

    console.timeEnd("Total transcription time");

    return result;
};
module.exports = { transcribeAudio};
