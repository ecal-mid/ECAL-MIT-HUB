let isAnonymous = false;
const firebaseConfig = {
	apiKey: '***-***-***',
	authDomain: '***-***.firebaseapp.com',
	databaseURL: 'https://***-***.firebaseio.com',
	projectId: '***-***',
	storageBucket: '***-***.appspot.com',
	messagingSenderId: '*************',
	appId: '************'
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
