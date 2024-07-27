const jwt = require('jsonwebtoken');
const db = require('../../config/firebase');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const cookie_token = req.cookies.token;
        const data = jwt.verify(token, process.env.JWT_KEY);
        const doc = await db.collection('users').doc(data.phone).get();
        if (!doc.exists) {
            throw new Error('No such user');
        }
        if (token === cookie_token) {
            req.phone = data.phone;
            req.token = token;
            next();
        }
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' });
    }
};

module.exports = auth;
