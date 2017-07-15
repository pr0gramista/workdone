firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    document.getElementById('landing').classList.remove('active')
    document.getElementById('app').classList.add('active')
  }
});

function loginWithGoogle() {
  console.log("Hi")
  var googleProvider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(googleProvider).then(function(result) {
    console.log("Logged in!")
  }).catch(function(error) {
    console.error(error)
  });
}
