const express = require('express');
const router = express.Router();
const db = require('../../config/firebase');
const geminiModel = require('../../config/gemini');

const getPostIdeas = async (topic) => {
    const geminiText = `Generate 10 ideas to create a caption with the topic of ${topic}
        MUST EXACTLY in the following format without the counter:
        **Idea:** Exploring possibilities where boundaries dissolve.`;
    const result = await geminiModel.generateContent(geminiText);
    if (!result.response || !result.response.text) {
        throw new Error('Invalid response from AI model');
    }
    const responseText = result.response.text();
    console.log(responseText);
    const sections = responseText.split('**Idea:**').filter(section => section.trim().length > 0);
    const ideas = sections.map(section => ({ idea: section.trim() }));
    return ideas;
}

router.post('/generate', async (req, res) => {
    try {
        const topic = req.body.topic;
        const ideas = await getPostIdeas(topic);
        res.json(ideas);
    } catch (error) {
        console.error("response error", error);
        if (error.message.includes('RECITATION')) {
            res.status(500).json({ error: "The AI model's response was blocked due to content policies. Please try again with a different prompt." });
        } else {
            res.status(500).send(error);
        }
    }
});

module.exports = router;
