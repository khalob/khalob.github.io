
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    // ...
  } else {
    // User is signed out.

  }
});

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function() {
    // Existing and future Auth states are now persisted in the current
    // session only. Closing the window would clear any existing state even
    // if a user forgets to sign out.
    // ...
    // New sign-in will be persisted with session persistence.
	
	// Initialize the FirebaseUI so users can sign in
	var ui = new firebaseui.auth.AuthUI(firebase.auth());

	ui.start('#firebaseui-auth-container', {
		signInFlow: 'popup',
		signInOptions: [
		// List of OAuth providers supported.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		]
		// Other config options...
	});
	
    return true;
}).catch(function(error) {
	// Handle Errors here.
	var errorCode = error.code;
	var errorMessage = error.message;
});
  
  