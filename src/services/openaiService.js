const fs = require("fs");
const util = require("util");
const axios = require("axios");
const { OpenAI } = require("openai");

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

const chatWithGpt = async (message, context) => {
    const fullPrompt = `${context}\n\n${message}`;
    const chatResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: fullPrompt }],
        temperature: 0.7,
    });
    return chatResponse.choices[0].message.content;
};

const synthesizeSpeech = async (text, outputPath) => {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;

    const requestBody = {
        input: { text },
        voice: {
            languageCode: "en-IN",
            name: "en-IN-Wavenet-C", // 👈 Indian English Male voice
        },
        audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.9,       // 👈 Slightly slower for clarity
          }
    };

    try {
        const response = await axios.post(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            requestBody
        );

        const audioContent = response.data.audioContent;
        const buffer = Buffer.from(audioContent, "base64");

        const writeFile = util.promisify(fs.writeFile);
        await writeFile(outputPath, buffer);
    } catch (err) {
        console.error("Google TTS API error:", err.response?.data || err.message);
        throw new Error("TTS synthesis failed.");
    }
};

module.exports = { transcribeAudio, chatWithGpt, synthesizeSpeech };
