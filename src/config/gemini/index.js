const { GoogleGenerativeAI } = require("@google/generative-ai");
const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-pro",
    geminiConfig,
});

module.exports = geminiModel;
