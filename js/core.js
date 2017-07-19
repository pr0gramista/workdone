var uid;

var newDeadline = {}

function updateDeadlines() {
  var now = _.now()
  var deadlines = document.getElementsByClassName('deadline')
  _.forEach(deadlines, function(deadline) {
    console.log('WOW')
    var end_date_field = deadline.getElementsByClassName('end_date')[0]
    end_date_field.innerHTML = deadline.getAttribute('end_date') - now
    console.log(end_date_field)
    console.log(deadline.getAttribute('end_date') - now)
  })
}
setInterval(updateDeadlines, 100)

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
    newDeadline.classList.add('deadline')
    newDeadline.id = data.key
    newDeadline.setAttribute('end_date', data.val().end_date)
    newDeadline.innerHTML = data.val().task + '<div class="end_date"></div>'
    document.getElementById('deadlines').prepend(newDeadline)
  });
}

function addDeadline() {
  var task = document.getElementById('deadline-task').value
  var end_date = getNewDeadlineDate()

  firebase.database().ref('deadlines/' + uid).push().set({
    task: task,
    creation_date: _.now(),
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
