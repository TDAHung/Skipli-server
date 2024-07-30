const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const cookie_token = req.cookies.accessToken;
        if (!token || !cookie_token) {
            return res.status(401).send({ error: 'Access Token is expired' });
        }

        const data = jwt.verify(token, process.env.JWT_KEY);

        if (token === cookie_token) {
            req.phone = data.phone;
            req.token = token;
            next();
        } else {
            res.status(401).send({ error: 'Tokens do not match' });
        }
    } catch (error) {
        res.status(401).send({ error: 'Invalid or expired access token' });
    }
};

module.exports = auth;
