const admin = require('firebase-admin');
const credentials = require('../../../skipli-key.json');
const dotenv = require('dotenv');
dotenv.config();

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});
const db = admin.firestore();
module.exports = db;
