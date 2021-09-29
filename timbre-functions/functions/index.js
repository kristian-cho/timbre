const functions = require("firebase-functions");

const app = require('express')();

const { db } = require('./util/admin');

const { 
    getAllPosts,
    postOnePost, 
    getPost, 
    commentOnPost, 
    likePost, 
    unlikePost, 
    deletePost,
    repostPost,
    unrepostPost 
} = require('./handlers/posts');

const { 
    signup, 
    login, 
    uploadImage, 
    addUserDetails, 
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead,
    followUser,
    unfollowUser 
} = require('./handlers/users'); 

const FBAuth = require('./util/FBAuth');

// Post Routes
// app.get('/posts', getAllPosts);
app.post('/post', FBAuth, postOnePost);
app.get('/post/:postId', getPost);
app.delete('/post/:postId', FBAuth, deletePost);
app.get('/post/:postId/like', FBAuth, likePost);
app.get('/post/:postId/unlike', FBAuth, unlikePost);
app.post('/post/:postId/comment', FBAuth, commentOnPost);
// TODO: delete comment on post
app.get('/post/:postId/repost', FBAuth, repostPost);
app.get('/post/:postId/unrepost', FBAuth, unrepostPost);

// Users Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);
app.get('/user/:handle/follow', FBAuth, followUser);
app.get('/user/:handle/unfollow', FBAuth, unfollowUser);


exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/posts/${snapshot.data().postId}`).get()
            .then((doc) => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'like',
                        read: false,
                        postId: doc.id
                    })
                }
            })
            .catch((err) => {
                console.error(err);
                return;
            })
    });

exports.deleteNotificationOnUnlike = functions.region('us-central1').firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => {
                console.error(err);
                return;
            })
    });

exports.createNotificationOnComment = functions.region('us-central1').firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/posts/${snapshot.data().postId}`).get()
            .then((doc) => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        postId: doc.id
                    })
                }
            })
            .catch((err) => {
                console.error(err);
                return;
            })
    });

exports.createNotificationOnRepost = functions.region('us-central1').firestore.document('reposts/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/posts/${snapshot.data().postId}`).get()
            .then((doc) => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'repost',
                        read: false,
                        postId: doc.id
                    })
                }
            })
            .catch((err) => {
                console.error(err);
                return;
            })
    });

exports.deleteNotificationOnUnrepost = functions.region('us-central1').firestore.document('reposts/{id}')
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => {
                console.error(err);
                return;
            })
    });

exports.onUserImageChange = functions.region('us-central1').firestore.document('/users/{userId}')
    .onUpdate((change) => {
        console.log(change.before.data());
        console.log(change.after.data());
        if(change.before.data().imageUrl !== change.after.data().imageUrl) {
            console.log('image has changed');
            const batch = db.batch();
            return db.collection('posts').where('userHandle', '==', change.before.data().handle).get()
                .then((data) => {
                    data.forEach(doc => {
                        const post = db.doc(`/posts/${doc.id}`);
                        batch.update(post, { userImage: change.after.data().imageUrl });
                    })
                    return batch.commit();
                })
        } else return true;
    });

exports.onPostDelete = functions.region('us-central1').firestore.document('/posts/{postId}')
    .onDelete((snapshot, context) => {
        const postId = context.params.postId;
        const batch = db.batch();
        return db.collection('comments').where('postId', '==', postId).get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                })
                return db.collection('likes').where('postId', '==', postId).get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                })
                return db.collection('reposts').where('postId', '==', postId).get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/reposts/${doc.id}`));
                })
                return db.collection('notifications').where('postId', '==', postId).get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return batch.commit();
            })
            .catch(err => console.error(err));
    });