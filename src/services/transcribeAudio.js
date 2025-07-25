const { OpenAI } = require("openai"); 
const fs = require("fs");
const path = require("path");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const transcribeAudio = async (filePath) => {
    return await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        language: "en",
    });
};
module.exports = { transcribeAudio};
