const fs = require("fs");
const path = require("path");
const util = require("util");
const { transcribeAudio, chatWithGpt, synthesizeSpeech } = require("../services/openaiService");
const { saveConversation } = require("../db/conversations");

const handleAiConversation = async (req, res) => {
    const startTime = Date.now();
    console.log(`\n[${new Date().toISOString()}] 🚀 New AI conversation request`);

    const userContext = req.body.userContext || "You are a helpful AI assistant. Please respond to the user's query.";
    console.log(`User context: ${userContext}`);
    const userId = req.body.userId;
    const audioPath = req.file.path;

    try {
        // Step 1: Transcription
        console.time("🕒 Transcription");
        const transcript = await transcribeAudio(audioPath);
        console.timeEnd("🕒 Transcription");

        // Cleanup uploaded file
        fs.unlinkSync(audioPath);

        // Step 2: LLM response
        console.time("🕒 GPT Response");
        const gptResponse = await chatWithGpt(transcript.text, userContext);
        console.timeEnd("🕒 GPT Response");

        // Step 3: Save to DB
        console.time("🕒 DB Save");
         saveConversation({
            userId: userId,
            inputText: transcript.text,
            responseText: gptResponse,
        }).catch((err) => {
            console.error("❌ Error saving conversation (non-blocking):", err);
        });
        console.timeEnd("🕒 DB Save");

        // Step 4: Text-to-Speech
        console.time("🕒 Text-to-Speech");
        const audioFilename = `tts-${Date.now()}.mp3`;
        const audioFilePath = path.join(__dirname, "..", "public", audioFilename);
        await synthesizeSpeech(gptResponse, audioFilePath);
        console.timeEnd("🕒 Text-to-Speech");

        // Final response
        const totalTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ✅ Request completed in ${totalTime}ms`);

        res.json({
            transcription: transcript.text,
            response: gptResponse,
            audioUrl: `/public/${audioFilename}`
        });

    } catch (err) {
        console.error(`[${new Date().toISOString()}] ❌ Error during AI conversation:`, err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

module.exports = { handleAiConversation };