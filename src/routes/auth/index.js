const express = require('express');
const router = express.Router();
const db = require('../../config/firebase');
const jwt = require('jsonwebtoken');
const { BadRequestException, NotFoundException } = require('../../filter');

const CreateNewAccessCode = async (phone) => {
    try {
        const expired = 60 * 1000;
        const otp = Math.floor(100000 + Math.random() * 90000);
        //send OTP by SMS
        const result = await db.collection('users').doc(phone).set({ otp });
        setTimeout(async () => {
            await db.collection('users').doc(phone).delete();
        }, expired);
        return otp;
    } catch (error) {
        console.log(error);
    }
}

const ValidateAccessCode = async (phone, _otp) => {
    try {
        const userRef = await db.collection('users').doc(phone).get();
        if (!userRef.data()) throw new NotFoundException('OTP is Incorrect');
        const { otp } = userRef.data();
        if (_otp === otp) return true;
        else return false;
    } catch (error) {
        throw error;
    }
}

router.post('/get-otp', async (req, res) => {
    try {
        if (!req.body.phone) {
            throw new BadRequestException('Phone number is required');
        }
        const phone = req.body.phone;
        const otp = await CreateNewAccessCode(phone);
        res.status(201).json({ success: true, otp });
    } catch (error) {
        if (error instanceof BadRequestException) {
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            console.error(error);
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const _phone = req.body.phone;
        const _otp = req.body.otp;
        if (!_phone) throw new BadRequestException('Phone number is required');
        if (!_otp) throw new BadRequestException('OTP is required');
        const otp = await ValidateAccessCode(_phone, _otp);
        if (otp) {
            const token = jwt.sign({ phone: _phone }, process.env.JWT_KEY)
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600 * 1000 //ms
            });
            res.json({ success: true, token: token, phone: _phone, message: "Login Successful" });
        } else throw new BadRequestException('OTP is Incorrect');
    } catch (error) {
        if (error instanceof BadRequestException) {
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            console.error(error);
        }
    }
});

module.exports = router;
