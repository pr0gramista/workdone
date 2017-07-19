var uid;

var newDeadline = {}

function getNewDeadlineDate() {
  var day = document.getElementById('deadline-day').value
  var month = document.getElementById('deadline-month').value
  var year = document.getElementById('deadline-year').value
  var hour = document.getElementById('deadline-hour').value
  var minute = document.getElementById('deadline-minute').value

  return new Date(year, month - 1, day, hour, minute)
}

function updateNewDeadlineDate() {
  var date = getNewDeadlineDate()
  document.getElementById('deadline-date-display').innerHTML = date.toJSON()
}

function initalizeApp() {
  document.getElementById('landing').classList.remove('active')
  document.getElementById('app').classList.add('active')

  document.getElementById('deadline-day').addEventListener("input", updateNewDeadlineDate, false);
  document.getElementById('deadline-month').addEventListener("input", updateNewDeadlineDate, false);
  document.getElementById('deadline-year').addEventListener("input", updateNewDeadlineDate, false);
  document.getElementById('deadline-hour').addEventListener("input", updateNewDeadlineDate, false);
  document.getElementById('deadline-minute').addEventListener("input", updateNewDeadlineDate, false);

  firebase.database().ref('deadlines/' + uid).on('child_added', function(data) {
    var newDeadline = document.createElement('li')
    newDeadline.innerHTML = data.val().task + '<div class="date">' + data.val().end_date + '</div>'
    document.getElementById('deadlines').prepend(newDeadline)
  });
}

function addDeadline() {
  var task = document.getElementById('deadline-task').value
  var now = new Date()
  var end_date = getNewDeadlineDate()

  firebase.database().ref('deadlines/' + uid).push().set({
    task: task,
    creation_date: now.getTime(),
    end_date: end_date.getTime()
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
