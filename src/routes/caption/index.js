const express = require('express');
const router = express.Router();
const db = require('../../config/firebase');
const geminiModel = require('../../config/gemini');
const { v4: uuidv4 } = require("uuid");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_USERNAME,
        pass: process.env.APP_PASSWORD
    }
});


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
    const captions = sections.map(section => (section.trim()));
    return captions;
}

const SaveGeneratedContent = async (topic, data) => {
    try {
        const id = data.phone;
        const captionJson = {
            id: data.id,
            caption: data.caption || null,
            socialNetwork: data.socialNetwork || null,
            tone: data.tone || null,
        };
        const postsSnapshot = await db.collection('captions').doc(id).get();
        const posts = postsSnapshot.data().posts;
        const index = posts.findIndex(post => post.topic === topic);
        if (index > 0) {
            posts[index].captions.push(captionJson);
        } else {
            posts.push({ topic, captions: [captionJson] });
        }

        const response = await db.collection('captions').doc(id).set({ posts });
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

const UnSaveCaption = async (phone, id) => {
    const response = await db.collection('captions').doc(phone).get();
    const posts = response.data().posts;
    posts.forEach((post, index) => {
        const indexPost = post.captions.findIndex(caption => caption.id === id);
        if (indexPost > -1) {
            post.captions.splice(indexPost, 1);
            if (post.captions.length === 0) {
                posts.splice(index, 1);
            }
        }
    });
    await db.collection('captions').doc(phone).set({ posts });
    return true;
}

router.get('/', async (req, res) => {
    try {
        const phone = req.phone;
        const captionSnapshot = await db.collection('captions').doc(phone).get();
        const captions = captionSnapshot.data().posts;
        let responseArray = [];
        captions.forEach(caption => {
            responseArray.push(caption);
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

router.post('/email', async (req, res) => {
    try {
        const email = req.body.email;
        const content = req.body.content;
        const topic = req.body.topic;
        const mailOptions = {
            from: 'youremail@gmail.com',
            to: email,
            subject: `Share captions from SKIPLI with topic ${topic}`,
            text: content
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Email sent: ${info.response}`);
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.log(error);
    }
});

router.post('/save', async (req, res) => {
    try {
        const topic = req.body.topic;
        const data = {
            id: uuidv4(),
            phone: req.phone,
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
        const isUnsaved = await UnSaveCaption(phone, id);
        res.json({ success: isUnsaved });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
