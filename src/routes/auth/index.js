const express = require('express');
const router = express.Router();
const db = require('../../config/firebase');
const jwt = require('jsonwebtoken');

const CreateNewAccessCode = async (phone) => {
    try {
        const expired = 60 * 1000;
        const result = await db.collection('users').doc(phone).set({ otp: Math.floor(100000 + Math.random() * 90000) });
        setTimeout(async () => {
            await db.collection('users').doc(phone).delete();
        }, expired);
        return result;
    } catch (error) {
        console.log(error);
    }
}

router.post('/get-otp', async (req, res) => {
    try {
        if (!req.body.phone) {
            throw Error('Phone number is required');
        }
        const phone = req.body.phone;
        await CreateNewAccessCode(phone);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error });
        console.error(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const _phone = req.body.phone;
        const _otp = req.body.otp;
        const userRef = await db.collection('users').doc(_phone).get();
        const { otp } = userRef.data();
        if (_otp === otp) {
            const token = jwt.sign({ phone: _phone }, process.env.JWT_KEY)
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600 * 1000 //ms
            });
            res.json({ success: true, token: token, phone: _phone, message: "Login Successful" });
        } else {
            res.status(401).json({ success: false, message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
