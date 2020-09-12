// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

ui.start('#firebaseui-auth-container', {
	signInFlow: 'popup',
	signInOptions: [
    // List of OAuth providers supported.
		firebase.auth.GoogleAuthProvider.PROVIDER_ID
	]
	// Other config options...
});