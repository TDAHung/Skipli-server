const express = require('express');
const app = express();
const admin = require('firebase-admin');
const credentials = require('./skipli-key.json');
const dotenv = require('dotenv');
dotenv.config();
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

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});
const db = admin.firestore();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/create', async (req, res) => {
    try {
        const id = req.body.email;
        const userJson = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        };
        const response = db.collection('users').doc(id).set(userJson);
        res.send(req.body);
    } catch (error) {
        res.send(error);
        console.error(error);
    }
});

app.get('/users', async (req, res) => {
    try {
        const usersRef = db.collection('users');
        const response = await usersRef.get();
        let responseArray = [];
        response.forEach(doc => {
            responseArray.push(doc.data());
        });
        res.send(responseArray);
    } catch (error) {
        res.send(error);
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const response = await userRef.get();
        res.send(response.data());
    } catch (error) {
        res.send(error);
    }
});

app.post('/generate', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const result = await geminiModel.generateContent(prompt);

        if (!result.response || !result.response.text) {
            throw new Error('Invalid response from AI model');
        }
        const responseText = result.response.text();
        console.log(responseText);

        // Split the response into individual captions and remove the **Caption:** prefix
        const sections = responseText.split('**Caption:**').filter(section => section.trim().length > 0);
        const captions = sections.map(section => ({ caption: section.trim() }));

        res.json(captions);
    } catch (error) {
        console.error("response error", error);

        if (error.message.includes('RECITATION')) {
            res.status(500).json({ error: "The AI model's response was blocked due to content policies. Please try again with a different prompt." });
        } else {
            res.status(500).send(error);
        }
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
