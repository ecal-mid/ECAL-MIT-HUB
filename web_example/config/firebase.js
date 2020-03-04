let isAnonymous = false;
const firebaseConfig = {
	apiKey: 'AIzaSyDyi-PtW0m_0dK1MzX6x-Vha9W_yS19Y80',
	authDomain: 'ecal-mit-hub.firebaseapp.com',
	databaseURL: 'https://ecal-mit-hub.firebaseio.com',
	projectId: 'ecal-mit-hub',
	storageBucket: 'ecal-mit-hub.appspot.com',
	messagingSenderId: '1088993903670',
	appId: '1:1088993903670:web:5d9e6bac6498480b19c497'
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase
	.auth()
	.signInAnonymously()
	.catch(function(error) {
		// Handle Errors here.
		let errorCode = error.code;
		let errorMessage = error.message;
		console.log('anonymously auth error ----- ' + errorCode);
		console.log(errorCode);
	});
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		isAnonymous = user.isAnonymous;
		uid = user.uid;
		// ...
	} else {
		// User is signed out.
		// ...
	}
	// ...
});
