const express = require('express');
const router = express.Router();
const db = require('../../config/firebase');
const geminiModel = require('../../config/gemini');

const GeneratePostCaptions = async (socialNetwork, subject, tone) => {
    const geminiText = `Generate 10 long captions and there coresponding 2 to 5 hastags with the ideal of ${subject}
    and style tone ${tone} with provider is ${socialNetwork}
    MUST EXACTLY in the following format without the counter:
    **Caption:** content #hastag`;
    const result = await geminiModel.generateContent(geminiText);
    if (!result.response || !result.response.text) {
        throw new Error('Invalid response from AI model');
    }
    const responseText = result.response.text();
    const sections = responseText.split('**Caption:**').filter(section => section.trim().length > 0);
    const captions = sections.map(section => ({ caption: section.trim() }));
    return captions;
}

const CreateCaptionsFromIdeas = async (idea) => {
    const geminiText = `Generate 10 long captions and there coresponding 2 to 5 hastags with the idea of ${idea}
    MUST EXACTLY in the following format without the counter:
    **Caption:** content #hastag`;
    const result = await geminiModel.generateContent(geminiText);
    if (!result.response || !result.response.text) {
        throw new Error('Invalid response from AI model');
    }
    const responseText = result.response.text();
    const sections = responseText.split('**Caption:**').filter(section => section.trim().length > 0);
    const captions = sections.map(section => ({ caption: section.trim() }));
    return captions;
}

const SaveGeneratedContent = async (topic, data) => {
    try {
        const id = data.phone;
        const captionJson = {
            topic,
            caption: data.caption || null,
            socialNetwork: data.socialNetwork || null,
            tone: data.tone || null,
        };
        const response = await db.collection('captions').doc(id).collection('posts').add(captionJson);
        return true;
    } catch (error) {
        console.error("response error", error);
        if (error.message.includes('RECITATION')) {
            res.status(500).json({ error: "The AI model's response was blocked due to content policies. Please try again with a different prompt." });
        } else {
            res.status(500).send(error);
        }
    }
}

router.get('/', async (req, res) => {
    try {
        const phone = req.phone;
        const response = await db.collection('captions').doc(phone).collection('posts').get();
        let responseArray = [];
        response.forEach(doc => {
            responseArray.push(doc.data());
        });
        res.send(responseArray);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/generate-from-scratch', async (req, res) => {
    try {
        const subject = req.body.subject;
        const tone = req.body.tone;
        const socialNetwork = req.body.socialNetwork;
        const captions = await GeneratePostCaptions(socialNetwork, subject, tone);
        res.json(captions);
    } catch (error) {
        console.error("response error", error);
        if (error.message.includes('RECITATION')) {
            res.status(500).json({ error: "The AI model's response was blocked due to content policies. Please try again with a different prompt." });
        } else {
            res.status(500).json(error);
        }
    }
});

router.post('/generate-from-idea', async (req, res) => {
    try {
        const idea = req.body.idea;
        const captions = await CreateCaptionsFromIdeas(idea);
        res.json(captions);
    } catch (error) {
        console.error("response error", error);
        if (error.message.includes('RECITATION')) {
            res.status(500).json({ error: "The AI model's response was blocked due to content policies. Please try again with a different prompt." });
        } else {
            res.status(500).json(error);
        }
    }
});

router.post('/save', async (req, res) => {
    try {
        const topic = req.body.topic;
        const data = {
            phone: req.body.phone,
            caption: req.body.caption,
            socialNetwork: req.body.socialNetwork,
            tone: req.body.tone,
        };
        const isSaved = await SaveGeneratedContent(topic, data);
        res.json({ success: isSaved });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const phone = req.phone;
        console.log(123);
        const response = await db.collection('captions').doc(phone).collection('posts').doc(id).delete();
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
