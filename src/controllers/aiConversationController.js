const fs = require("fs");
const path = require("path");
const util = require("util");
const { transcribeAudio, chatWithGpt, synthesizeSpeech } = require("../services/openaiService");
const { saveConversation } = require("../db/conversations");

const handleAiConversation = async (req, res) => {
    const userContext = req.body.userContext || "You are a helpful AI assistant. Please respond to the user's query.";
    const userId = req.body.userId
    const audioPath = req.file.path;

     try {
        const transcript = await transcribeAudio(audioPath);
        fs.unlinkSync(audioPath); 
        const gptResponse = await chatWithGpt(transcript.text, userContext);
         await saveConversation({
             userId: userId, 
             inputText: transcript.text,
             responseText: gptResponse,
         });

         const audioFilename = `tts-${Date.now()}.mp3`;
         const audioFilePath = path.join(__dirname, "..", "public", audioFilename);
         await synthesizeSpeech(gptResponse, audioFilePath);
         res.json({
             transcription: transcript.text,
             response: gptResponse,
             audioUrl: `/public/${audioFilename}`
         });
        
     } catch (err) {
         console.error("Error:", err);
         res.status(500).json({ error: "Something went wrong" });
     }
};

module.exports = { handleAiConversation };
