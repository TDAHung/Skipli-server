const express = require('express');
const router = express.Router();
const db = require('../../config/firebase');
const geminiModel = require('../../config/gemini');

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
    try {
        const id = req.body.phone;
        const userJson = {
            phone: req.body.phone,
        };
        const response = db.collection('users').doc(id).set(userJson);
        res.send(req.body);
    } catch (error) {
        res.send(error);
        console.error(error);
    }
});


router.get('/:id', async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const response = await userRef.get();
        res.send(response.data());
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;
