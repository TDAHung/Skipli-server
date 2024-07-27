const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authMiddleware = require('./src/middleware/auth');

const userRoute = require('./src/routes/user');
const captionRoute = require('./src/routes/caption');
const ideaRouter = require('./src/routes/idea');
const authRouter = require('./src/routes/auth');

app.use('/users', authMiddleware, userRoute);
app.use('/captions', authMiddleware, captionRoute);
app.use('/ideas', authMiddleware, ideaRouter);
app.use('/auth', authRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
