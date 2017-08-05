var uid
var messaging

var calendarFormat = {
  sameDay: '[Today at] H:mm',
  nextDay: '[Tomorrow at] H:mm',
  nextWeek : 'dddd [at] H:mm',
  lastDay: '[Yesterday at] H:mm',
  lastWeek : '[last] dddd [at] H:mm',
  sameElse: 'DD/MM/YYYY H:mm'
}

function initalizeMessaging() {
  messaging.requestPermission().then(function() {
    console.log("Notifications :)")

    messaging.getToken().then(function(newToken) {
      console.log("Reading token...")
      if (newToken) {
        firebase.database().ref('fcm/' + uid).orderByValue().equalTo(newToken).once('value').then(function (data) {
          if (data.val() == null) {
            firebase.database().ref('fcm/' + uid).push().set(newToken)
            console.log("Saving token")
          } else {
            console.log("Token already saved");
          }
        })
      }
    })
    .catch(function (error) {
      console.error('Error while getting token', error)
    })
  })
  .catch(function(error) {
    console.error('Notification permission denied with error: ' + error)
  })

  // If token was changed, update the data in database
  messaging.onTokenRefresh(function() {
    console.log("Token changed")
    messaging.getToken().then(function(newToken) {
      if (newToken) {
        firebase.database().ref('fcm/' + uid).orderByValue().equalTo(newToken).once('value').then(function (data) {
          if (data.val() == null) {
            firebase.database().ref('fcm/' + uid).push().set(newToken)
            console.log("Saving token")
          } else {
            console.log("Token already saved");
          }
        })
      }
    })
    .catch(function(error) {
      console.error('Error while refreshing token', error)
    })
  })

  messaging.onMessage(function (data) {
    addAlert(data.notification.title + ': ' + data.notification.body, 5000)
  })
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
    messaging = firebase.messaging()
    initalizeMessaging()
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

// Alerts
function removeAlert(id) {
  document.querySelector(`.alert[alert="${id}"]`).remove()
}

function addAlert(text, time) {
  var alert = document.createElement('div')
  alert.innerHTML = text
  alert.classList.add('alert')
  var alertID = Math.random().toString(36).substring(7)
  alert.setAttribute('alert', alertID)
  setTimeout(removeAlert, time, alertID)
  document.getElementById('alerts').append(alert)
}
