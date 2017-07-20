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

  var dayDefault = document.getElementById('deadline-day').getAttribute('placeholder')
  var monthDefault = document.getElementById('deadline-month').getAttribute('placeholder')
  var yearDefault = document.getElementById('deadline-year').getAttribute('placeholder')
  var hourDefault = document.getElementById('deadline-hour').getAttribute('placeholder')
  var minuteDefault = document.getElementById('deadline-minute').getAttribute('placeholder')

  day = day.length == 0 ? dayDefault : day
  month = month.length == 0 ? monthDefault : month
  year = year.length == 0 ? yearDefault : year
  hour = hour.length == 0 ? hourDefault : hour
  minute = minute.length == 0 ? minuteDefault : minute

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

  // Fill placeholders
  var now = moment().add(1, 'day')

  var dayElement = document.getElementById('deadline-day')
  dayElement.addEventListener("input", updateNewDeadlineDate, false)
  dayElement.setAttribute('placeholder', now.date())
  var monthElement = document.getElementById('deadline-month')
  monthElement.addEventListener("input", updateNewDeadlineDate, false)
  monthElement.setAttribute('placeholder', now.format('MM'))
  var yearElement = document.getElementById('deadline-year')
  yearElement.addEventListener("input", updateNewDeadlineDate, false)
  yearElement.setAttribute('placeholder', now.year())
  var hourElement = document.getElementById('deadline-hour')
  hourElement.addEventListener("input", updateNewDeadlineDate, false)
  hourElement.setAttribute('placeholder', now.hours())
  var minuteElement = document.getElementById('deadline-minute')
  minuteElement.addEventListener("input", updateNewDeadlineDate, false)
  minuteElement.setAttribute('placeholder', now.format('mm'))

  // Update new deadline date (it will use placeholder values)
  updateNewDeadlineDate()

  // Set Firebase reference to deadlines
  var deadlinesRef = firebase.database().ref('deadlines/' + uid)
  deadlinesRef.on('child_added', function(data) {
    // Create new deadline
    var newDeadline = document.createElement('li')
    newDeadline.classList.add('deadline')
    newDeadline.id = data.key
    newDeadline.setAttribute('end_date', data.val().end_date)
    newDeadline.innerHTML = data.val().task + '<button onclick="removeDeadline(\'' + data.key + '\')">X</button><div class="end_date"></div>'

    // Prepend to DOM
    document.getElementById('deadlines').prepend(newDeadline)
  })

  deadlinesRef.on('child_removed', function(data) {
    // Remove deadline by using id
    var element = document.getElementById(data.key)
    if (element != null) {
      element.remove()
    }
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
