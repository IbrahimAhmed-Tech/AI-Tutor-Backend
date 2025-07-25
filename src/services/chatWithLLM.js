
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const chatWithLLM = async (message, context) => {
    const fullPrompt = `${context}\n\n${message}`;
    const chatResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: fullPrompt }],
        temperature: 0.7,
    });
    return chatResponse.choices[0].message.content;
};

module.exports = {chatWithLLM};