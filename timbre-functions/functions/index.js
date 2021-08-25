const functions = require("firebase-functions");

const app = require('express')();

const { getAllPosts, postOnePost } = require('./handlers/posts');
const { signup, login } = require('./handlers/users'); 

const FBAuth = require('./util/FBAuth');

// Post Routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, postOnePost);

// Users Routes
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);