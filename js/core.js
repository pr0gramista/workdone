var uid

var calendarFormat = {
  sameDay: '[Today at] H:mm',
  nextDay: '[Tomorrow at] H:mm',
  nextWeek : 'dddd [at] H:mm',
  lastDay: '[Yesterday at] H:mm',
  lastWeek : '[last] dddd [at] H:mm',
  sameElse: 'DD/MM/YYYY H:mm'
}

/*
 * Initialize app by setting event listeners etc.
 */
function initalizeApp() {
  // Change route
  document.getElementById('landing').classList.remove('active')
  document.getElementById('app').classList.add('active')

  // Set event listener for new deadline modal
  document.getElementById('show-newdeadline').addEventListener('click', showNewDeadlineModal)
  document.getElementById('new-deadline').addEventListener('click', function (e) {
    if (e.target.id === 'new-deadline') { // Hit the blackbox
      hideNewDeadlineModal()
    }
  })

  // Fill placeholders
  fillPlaceholdersForNewDeadline()
  // Every minute update the date
  setInterval(fillPlaceholdersForNewDeadline, 60)

  // Set Firebase reference to deadlines
  var deadlinesRef = firebase.database().ref('deadlines/' + uid)
  deadlinesRef.on('child_added', function(data) {
    addDeadlineElement(data) 
  })

  deadlinesRef.on('child_removed', function(data) {
    removeDeadlineElement(data)
  })
}

function removeDeadline(key) {
  firebase.database().ref('deadlines/' + uid + '/' + key).remove()
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
