var uid;

function updateDeadlineDate(event) {
  // TODO date parsing
  var date = new Date(event.target.value)
  document.getElementById('deadline-date-display').innerHTML = date
}

function initalizeApp() {
  document.getElementById('landing').classList.remove('active')
  document.getElementById('app').classList.add('active')

  document.getElementById('deadline-date').addEventListener("input", updateDeadlineDate, false);

  firebase.database().ref('deadlines/' + uid).on('child_added', function(data) {
    var newDeadline = document.createElement('li')
    newDeadline.innerHTML = data.val().task + '<div class="date">' + data.val().end_date + '</div>'
    document.getElementById('deadlines').prepend(newDeadline)
  });
}

function addDeadline() {
  var task = document.getElementById('deadline-task').value
  var date = document.getElementById('deadline-date').value
  firebase.database().ref('deadlines/' + uid).push().set({
    task: task,
    creation_date: new Date().toJSON(),
    end_date: new Date()
  })
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    uid = user.uid
    initalizeApp()
  }
})

function loginWithGoogle() {
  var googleProvider = new firebase.auth.GoogleAuthProvider()
  firebase.auth().signInWithPopup(googleProvider).then(function(result) {
    console.log("Logged in!")
  }).catch(function(error) {
    console.error(error)
  })
}
