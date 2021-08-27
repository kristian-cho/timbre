const functions = require("firebase-functions");

const app = require('express')();

const { getAllPosts, postOnePost, getPost, commentOnPost } = require('./handlers/posts');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users'); 

const FBAuth = require('./util/FBAuth');

// Post Routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, postOnePost);
app.get('/post/:postId', getPost);
// TODO: delete post 
// TODO: like post
// TODO: unlike post
app.post('/post/:postId/comment', FBAuth, commentOnPost);
// TODO: delete comment on post
// TODO: repost
// TODO: undo repost

// Users Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);