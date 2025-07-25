const axios = require("axios"); 
const { v4: uuidv4 } = require("uuid");
const supabase = require("../../supabaseClient");

const apiKey = process.env.GOOGLE_TTS_API_KEY;


const synthesizeAndUploadTTS = async (text) => {
    

    // 1. TTS Request to Google
    const requestBody = {
        input: { text },
        voice: {
            languageCode: "en-IN",
            name: "en-IN-Wavenet-C",
        },
        audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.9,
        },
    };

    try {
        const response = await axios.post(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            requestBody
        );

        const audioContent = response.data.audioContent;
        const audioBuffer = Buffer.from(audioContent, "base64");

        // 2. Upload to Supabase
        const fileName = `tts-${uuidv4()}.mp3`;

        const { error: uploadError } = await supabase.storage
            .from("tts-audios")
            .upload(fileName, audioBuffer, {
                contentType: "audio/mpeg",
                upsert: false,
            });

        if (uploadError) {
            throw new Error("Supabase upload failed: " + uploadError.message);
        }

        // 3. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from("tts-audios")
            .getPublicUrl(fileName);
        return publicUrlData.publicUrl;

    } catch (err) {
        console.error("❌ synthesizeAndUploadTTS error:", err.response?.data || err.message);
        throw new Error("TTS synthesis or upload failed.");
    }
};


module.exports = { synthesizeAndUploadTTS };