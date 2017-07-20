var uid

var calendarFormat = {
  sameDay: '[Today at] H:mm',
  nextDay: '[Tomorrow at] H:mm',
  nextWeek : 'dddd [at] H:mm',
  lastDay: '[Yesterday at] H:mm',
  lastWeek : '[last] dddd [at] H:mm',
  sameElse: 'DD/MM/YYYY H:mm'
}

function updateDeadlines() {
  var now = _.now()
  var deadlines = document.getElementsByClassName('deadline')
  _.forEach(deadlines, function(deadline) {
    var end_date_field = deadline.getElementsByClassName('end_date')[0]
    end_date_field.innerHTML = moment(deadline.getAttribute('end_date'), "x")
      .calendar(null, calendarFormat)
  })
}
setInterval(updateDeadlines, 100)

function validateNewDeadlineDate(event) {
  var month = document.getElementById('deadline-month').value
  var date = getNewDeadlineDate()
  return date.getMonth() === month
}

/*
 * Returns new date for new deadline, can
 * return null if date is invalid
 */
function getNewDeadlineDate() {
  var day = document.getElementById('deadline-day').value
  var month = document.getElementById('deadline-month').value
  var year = document.getElementById('deadline-year').value
  var hour = document.getElementById('deadline-hour').value
  var minute = document.getElementById('deadline-minute').value

  day = day.length == 0 ? '1' : day
  month = month.length == 0 ? '1' : month
  year = year.length == 0 ? '2017' : year
  hour = hour.length == 0 ? '12' : hour
  minute = minute.length == 0 ? '00' : minute

  day = _.toNumber(day)
  month = _.toNumber(month)
  year = _.toNumber(year)
  hour = _.toNumber(hour)
  minute = _.toNumber(minute)

  // Validate
  var checkDay = _.isFinite(day) && day >= 1 && day <= 31
  var checkMonth = _.isFinite(month) && month >= 1 && month <= 12
  var checkYear = _.isFinite(year) && year >= 2017
  var checkHour = _.isFinite(hour) && hour >= 0 && hour <= 23
  var checkMinute = _.isFinite(minute) && minute >= 0 && minute <= 59

  if (!checkDay || !checkMonth || !checkYear || !checkHour || !checkMinute)
    return null

  var date = new Date(year, month - 1, day, hour, minute)

  // Check if date is valid calendar day
  if (date.getMonth() + 1 !== month) {
    return null
  }

  // Check if date is bigger than now
  if (date.getTime() < _.now())
    return null

  return date
}

function updateNewDeadlineDate() {
  var date = getNewDeadlineDate()
  if (date != null) {
    document.getElementById('deadline-date-display').innerHTML = moment(date)
      .calendar(null, calendarFormat);
  } else {
    document.getElementById('deadline-date-display').innerHTML = "Invalid date :("
  }
}

/*
 * Initialize app by setting event listeners etc.
 */
function initalizeApp() {
  document.getElementById('landing').classList.remove('active')
  document.getElementById('app').classList.add('active')

  document.getElementById('deadline-day').addEventListener("input", updateNewDeadlineDate, false)
  document.getElementById('deadline-month').addEventListener("input", updateNewDeadlineDate, false)
  document.getElementById('deadline-year').addEventListener("input", updateNewDeadlineDate, false)
  document.getElementById('deadline-hour').addEventListener("input", updateNewDeadlineDate, false)
  document.getElementById('deadline-minute').addEventListener("input", updateNewDeadlineDate, false)

  firebase.database().ref('deadlines/' + uid).on('child_added', function(data) {
    var newDeadline = document.createElement('li')
    newDeadline.classList.add('deadline')
    newDeadline.id = data.key
    newDeadline.setAttribute('end_date', data.val().end_date)
    newDeadline.innerHTML = data.val().task + '<div class="end_date"></div>'
    document.getElementById('deadlines').prepend(newDeadline)
  })
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
