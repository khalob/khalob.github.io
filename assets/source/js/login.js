'use strict';

var login = {
	showAccount: function (userData) {
		$('#sign-in').hide();
		$('.account-image').attr('src', userData.photoURL);
		$('.account-name').text(userData.displayName);
		$('.account-email').text(userData.email);
		$('#account-info').show();
	},
	parseUserData: function (userData) {
		var str = userData && userData.toString ? userData.toString() : '';
		var data = str.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
		return data.trim ? data.trim() : data;
	},
	init: function () {
		firebase.auth().onAuthStateChanged(function (user) {
			if (user) {
				// User is signed in.
				login.showAccount(user.providerData[0]);
				$('body').trigger('user-sign-in');
			} else {
				// User is signed out.
				$('#account-info').hide();
				$('#sign-in').show();
				$('body').trigger('user-sign-out');
			}
		});

		// Events
		$('body').on('click', '#sign-out', function () {
			firebase.auth().signOut();
		});

		$('body').on('click', '#sign-in', function () {
			var provider = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithPopup(provider).catch(function (error) {
				// Handle Errors here.
				var errorMessage = error.message;
				alert(errorMessage);
			});
		});
	}
};

module.exports = login;