const fs = require("fs");
const path = require("path");
const util = require("util");
const stringSimilarity = require("string-similarity");
const predefinedResponses = require("../data/predefinedResponses.json");
const { transcribeAudio, chatWithLLM, saveConversation, synthesizeSpeech } = require("../services/openaiService");

const handleAiConversation = async (req, res) => {
    const startTime = Date.now();
    console.log(`\n[${new Date().toISOString()}] 🚀 New AI conversation request`);

    const userContext = req.body.userContext || "You are a helpful AI assistant. Please respond to the user's query.";
    console.log(`User context: ${userContext}`);
    const userId = req.body.userId;
    const audioPath = req.file.path;

    try {
        console.time("🕒 Transcription");
        const transcript = await transcribeAudio(audioPath);
        console.timeEnd("🕒 Transcription");

        fs.unlinkSync(audioPath);

        const userInput = transcript.text.toLowerCase().trim();
        const predefinedKeys = Object.keys(predefinedResponses);
        const { bestMatch } = stringSimilarity.findBestMatch(userInput, predefinedKeys);

        let gptResponse;
        let usedPredefined = false;

        if (bestMatch.rating > 0.65) {
            gptResponse = predefinedResponses[bestMatch.target];
            usedPredefined = true;
            console.log("✅ Used predefined response:", bestMatch.target);
        } else {
            console.time("🕒 GPT Response");
            gptResponse = await chatWithLLM(userInput, userContext);
            console.timeEnd("🕒 GPT Response");
        }

        console.time("🕒 DB Save");
        saveConversation({
            userId: userId,
            inputText: userInput,
            responseText: gptResponse,
            source: usedPredefined ? "predefined" : "llm"
        }).catch((err) => {
            console.error("❌ Error saving conversation (non-blocking):", err);
        });
        console.timeEnd("🕒 DB Save");

        console.time("🕒 Text-to-Speech");
        const audioFilename = `tts-${Date.now()}.mp3`;
        const audioFilePath = path.join(__dirname, "..", "public", audioFilename);
        await synthesizeSpeech(gptResponse, audioFilePath);
        console.timeEnd("🕒 Text-to-Speech");

        const totalTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ✅ Request completed in ${totalTime}ms`);

        res.json({
            transcription: userInput,
            response: gptResponse,
            audioUrl: `/public/${audioFilename}`
        });

    } catch (err) {
        console.error(`[${new Date().toISOString()}] ❌ Error during AI conversation:`, err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

module.exports = { handleAiConversation };