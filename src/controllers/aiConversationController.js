const fs = require("fs");
const path = require("path");
const stringSimilarity = require("string-similarity");
const predefinedResponses = require("../data/predefinedResponses.json");
const {transcribeAudio} = require ("../services/transcribeAudio.js")
const { saveConversation } = require("../services/saveConversation");
const { synthesizeAndUploadTTS } = require ("../services/synthesizeAndUploadSpeech.js")
const {chatWithLLM} = require ("../services/chatWithLLM");


const handleAiConversation = async (req, res) => {
   
    const startTime = Date.now();
    console.log(`\n[${new Date().toISOString()}] 🚀 New AI conversation request`);

    const userContext = req.body.userContext || "You are a helpful AI assistant. Please respond to the user's query.";
    console.log(`User context: ${userContext}`);
    const userId = req.body.userId;

    if (!req.file || !req.file.buffer) {
        console.error("❌ No audio file received.");
        return res.status(400).json({ error: "Audio file is missing." });
    }
    const audioBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    try {
        console.time("🕒 Transcription");
        const transcript = await transcribeAudio(audioBuffer, originalName);
        console.timeEnd("🕒 Transcription");

        
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
            source: usedPredefined ? "Predefined Responses" : "LLM"
        }).catch((err) => {
            console.error("❌ Error saving conversation (non-blocking):", err);
        });
        console.timeEnd("🕒 DB Save");

        console.time("🕒 Text-to-Speech and Upload TTS");
        
        const audioUrl = await synthesizeAndUploadTTS(gptResponse);
        console.timeEnd("🕒 Text-to-Speech and Upload TTS");

        const totalTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ✅ Request completed in ${totalTime}ms`);

        res.json({
            transcription: userInput,
            response: gptResponse,
            audioUrl: audioUrl
        });

    } catch (err) {
        console.error(`[${new Date().toISOString()}] ❌ Error during AI conversation:`, err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

module.exports = { handleAiConversation };