const firebaseConfig = {
    apiKey: "AIzaSyC85lDrkY2t0h8wBUKYkKrBuHQnvN6qnQc",
    authDomain: "verbiage-90f3c.firebaseapp.com",
    databaseURL: "https://verbiage-90f3c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "verbiage-90f3c",
    storageBucket: "verbiage-90f3c.appspot.com",
    messagingSenderId: "935754012234",
    appId: "1:935754012234:web:d86eda3d91810fed7af8b3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

function registerUser(username, email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            let id = userCredential.user.uid;
            localStorage.setItem('username', username);
            db.ref('users/' + id).set({
                username: username
            })
                .then(() => {
                    alert('Register successfully');
                    location.assign('user.html');
                })
        })
        .catch(e => alert(e.message));
}

function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user; 
            let id = user.uid;
            db.ref('users/' + id).get().then((snapshot) => {
                let username = snapshot.val().username;
                localStorage.setItem('userId', id);
                localStorage.setItem('username', username);
                alert('Sign in successfully');
                location.assign('user.html');
            });
        })
        .catch((e) => {
            alert(e.message);
        });
}

function logoutUser() {
    auth.signOut().then(() => {
        // Sign-out successful.
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        alert('sign out successfully');
    }).catch((e) => {
        alert(e.message);
    });
}

function getUsername() {
    let username = localStorage.getItem('username');
    return username == null ? 'anonymous' : username;
}

function redirectToAddSong() {
    location.assign('addSong.html');
}

function addSong(userId, songData) {
    let songId = db.ref('songs/').push().key;
    let data = {};
    data['songs/' + songId] = songData;

    return db.ref().update(data);
}

function editSong(userId, songId, songData) {
    if (userId !== songData.addedBy)
        return;
    
    let data = {};
    data['songs/' + songId] = songData;

    return db.ref().update(data);
}

function deleteSong(userId, songId) {
    db.ref('songs/' + songId).remove();
}

function addComment(songId, username, commentText) {
    let comments = db.ref('comments/' + songId);
    let commentKey = comments.push().key;
    let data = {};
    data['comments/' + songId + '/' + commentKey] = {
        username: username, 
        commentText: commentText,
        likes: 0,
        dislikes: 0
    };
    
    db.ref().update(data);
}

function mutateCommentRating(songId, commentId, node) {
    db
        .ref('comments')
        .child(songId)
        .child(commentId)
        .child(node)
        .set(firebase.database.ServerValue.increment(1));
}

function likeComment(songId, commentId) {
    mutateCommentRating(songId, commentId, 'likes');
}

function dislikeComment(songId, commentId) {
    mutateCommentRating(songId, commentId, 'dislikes');
}

function addAnnotation(songId, username, lineIndex, annotationText) {
    let annotationId = db.ref('annotations/' + songId).push().key;
    
    
    db.ref('annotations/' + songId + '/' + annotationId).set({
        line: lineIndex, 
        text: annotationText,
        username: username,
        likes: 0,
        dislikes: 0
    });
}

function mutateAnnotationRating(songId, annotationId, node) {
    db
        .ref('annotations')
        .child(songId)
        .child(annotationId)
        .child(node)
        .set(firebase.database.ServerValue.increment(1));
}

function likeAnnotation(songId, annotationId) {
    mutateAnnotationRating(songId, annotationId, 'likes');
}

function dislikeAnnotation(songId, annotationId) {
    mutateAnnotationRating(songId, annotationId, 'dislikes');
}

function deleteAnnotation(songId, annotationId) {
    db.ref('annotations/' + songId + '/' + annotationId).remove();
}
