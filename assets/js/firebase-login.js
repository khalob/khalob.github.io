function showAccount(userData) {
	$('#sign-in').hide();
	$('.account-image').attr('src', userData.photoURL);
	$('.account-name').text(userData.displayName);
	$('.account-email').text(userData.email);
	$('#account-info').show();
}

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		/*var displayName = user.displayName;
		var email = user.email;
		var emailVerified = user.emailVerified;
		var photoURL = user.photoURL;
		var isAnonymous = user.isAnonymous;
		var uid = user.uid;
		*/
		var providerData = user.providerData;
		showAccount(user.providerData);
		
	} else {
		// User is signed out.

		// Initialize the FirebaseUI so users can sign in
		/*var ui = new firebaseui.auth.AuthUI(firebase.auth());

		ui.start('#sign-in', {
			signInFlow: 'popup',
			signInSuccessUrl: window.location.href,
			signInOptions: [
			// List of OAuth providers supported.
				firebase.auth.GoogleAuthProvider.PROVIDER_ID
			]
			// Other config options...
		});*/
		
		
		$('#account-info').hide();
		$('#sign-in').show();
	}
});

$('body').on('click', '#sign-out', function () {
	firebase.auth().signOut();
});

$('body').on('click', '#sign-in', function () {
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a Google Access Token. You can use it to access the Google API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
	  var user = result.user;
	  
	  showAccount(user.providerData);
	  // ...
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  // ...
	});
});
  