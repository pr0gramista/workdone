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
 * Refresh deadlines DOM
 */
function updateDeadlines() {
  var deadlines = document.getElementsByClassName('deadline')
  _.forEach(deadlines, function(deadline) {
    var end_date_field = deadline.getElementsByClassName('end_date')[0]
    var end_date = moment(deadline.getAttribute('end_date'), "x")
    end_date_field.innerHTML = end_date.calendar(null, calendarFormat)

    if (deadline.classList.contains('display-timer')) {
      var timer = deadline.getElementsByClassName('timer')[0]
      var diff = end_date.diff()

      var duration = moment.duration(diff)
      var days = duration.days()
      if (days <= 0) {
        timer.innerHTML = moment.utc(diff).format("HH:mm:ss")
      } else if (days <= 2) {
        timer.innerHTML = Math.floor(duration.asHours()) + moment.utc(diff).format(":mm:ss")
      } else {
        timer.innerHTML = (days) + 'd ' + moment.utc(diff).format("HH:mm:ss")
      }
    }
  })
}
setInterval(updateDeadlines, 100)

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

/*
 * Updates display of new deadline's end date
 */
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

  // Set event listener for new deadline modal
  document.getElementById('show-newdeadline').addEventListener('click', showNewDeadlineModal)
  document.getElementById('new-deadline').addEventListener('click', function (e) {
    if (e.target.id === 'new-deadline') { // Hit the blackbox
      hideNewDeadlineModal()
    }
  })

  // Fill placeholders
  var tomorrow = moment().add(1, 'day')

  var dayElement = document.getElementById('deadline-day')
  dayElement.addEventListener("input", updateNewDeadlineDate, false)
  dayElement.setAttribute('placeholder', tomorrow.date())
  var monthElement = document.getElementById('deadline-month')
  monthElement.addEventListener("input", updateNewDeadlineDate, false)
  monthElement.setAttribute('placeholder', tomorrow.format('MM'))
  var yearElement = document.getElementById('deadline-year')
  yearElement.addEventListener("input", updateNewDeadlineDate, false)
  yearElement.setAttribute('placeholder', tomorrow.year())
  var hourElement = document.getElementById('deadline-hour')
  hourElement.addEventListener("input", updateNewDeadlineDate, false)
  hourElement.setAttribute('placeholder', tomorrow.hours())
  var minuteElement = document.getElementById('deadline-minute')
  minuteElement.addEventListener("input", updateNewDeadlineDate, false)
  minuteElement.setAttribute('placeholder', tomorrow.format('mm'))

  // Update new deadline date (it will use placeholder values)
  updateNewDeadlineDate()

  // Set Firebase reference to deadlines
  var deadlinesRef = firebase.database().ref('deadlines/' + uid)
  deadlinesRef.on('child_added', function(data) {
    var deadlineData = data.val()

    // Create new deadline
    var newDeadline = document.createElement('li')
    newDeadline.classList.add('deadline')
    newDeadline.classList.add('card')

    newDeadline.id = data.key
    newDeadline.setAttribute('end_date', deadlineData.end_date)

    if (deadlineData.display == 'timer') {
      newDeadline.classList.add('display-timer')
      newDeadline.innerHTML = `
      ${ deadlineData.task }
      <button id="remove-deadline" onclick="removeDeadline('${ data.key }')">
        <i class="material-icons">delete</i>
      </button>
      <div class="end_date"></div>
      <div class="timer"></div>
      `
    }

    // Prepend to DOM
    document.getElementById('deadlines').prepend(newDeadline)

    createDateShortcuts()
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
    end_date: end_date.getTime(),
    display: 'timer'
  })

  hideNewDeadlineModal()
}

function removeDeadline(key) {
  firebase.database().ref('deadlines/' + uid + '/' + key).remove()
}

var dateShortcutsCreated = false
function createDateShortcuts() {
  if (dateShortcutsCreated) {
    return
  }
  createDateShortcutElement('End of day', function () {
    var date = moment().endOf('day')
  })
  createDateShortcutElement('Tomorrow', function () {
    var date = moment().add(1, 'days')
  })
  createDateShortcutElement('3 days', function () {
    var date = moment().add(3, 'days')
  })
  createDateShortcutElement('End of week', function () {
    var date = moment().endOf('week')
  })
  createDateShortcutElement('1 week', function () {
    var date = moment().add(1, 'weeks')
  })
  createDateShortcutElement('End of month', function () {
    var date = moment().endOf('month')
  })
  createDateShortcutElement('1 month', function () {
    var date = moment().add(1, 'months')
  })
  dateShortcutsCreated = true
}

function createDateShortcutElement(name, listener) {
  var dateSuggestions = document.getElementsByClassName('date-suggestions')[0]
  var newDateSuggestion = document.createElement('div')
  newDateSuggestion.innerHTML = name
  newDateSuggestion.setAttribute('date', date)
  newDateSuggestion.classList.add('date-suggestion')
  newDateSuggestion.addEventListener('click', listener)
  dateSuggestions.append(newDateSuggestion)
}

/*
 * Add new deadline modal functions
 */
function showNewDeadlineModal() {
  document.getElementById('new-deadline').classList.add('show')
}

function hideNewDeadlineModal() {
  document.getElementById('new-deadline').classList.remove('show')
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
