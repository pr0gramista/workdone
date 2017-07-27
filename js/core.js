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

    // Logic for every type of display
    if (deadline.classList.contains('display-timer')) {
      var timer = deadline.getElementsByClassName('timer')[0]
      var diff = end_date.diff()

      if (moment().isAfter(end_date)) {
        timer.innerHTML = '00:00:00'
        return
      }

      var duration = moment.duration(diff)
      var days = duration.days()
      if (days <= 0) {
        timer.innerHTML = moment.utc(diff).format("HH:mm:ss")
      } else if (days <= 2) {
        timer.innerHTML = Math.floor(duration.asHours()) + moment.utc(diff).format(":mm:ss")
      } else {
        timer.innerHTML = (days) + 'd ' + moment.utc(diff).format("HH:mm:ss")
      }
    } else if (deadline.classList.contains('display-bar')) {
      var bar = deadline.getElementsByClassName('bar-fill')[0]
      var creation_date = moment(deadline.getAttribute('creation_date'), "x")

      var timerDelta = end_date.diff(creation_date)
      var timeSinceCreation = end_date.diff()

      var percentage = 100 - (timeSinceCreation/timerDelta * 100)
      percentage = moment().isAfter(end_date) ? 100 : percentage

      bar.style.width = percentage.toFixed(2) + '%';
    } else if (deadline.classList.contains('display-blocks')) {
      var blocks = deadline.getElementsByClassName('block')
      var creation_date = moment(deadline.getAttribute('creation_date'), "x")

      var timerDelta = end_date.diff(creation_date)
      var timeSinceCreation = end_date.diff()

      var percentage = 1 - (timeSinceCreation/timerDelta)
      percentage = moment().isAfter(end_date) ? 1 : percentage
      var howManyBlocksBlack = Math.floor(percentage * 20)

      // blockHealth is percentage time of next dying block
      if (howManyBlocksBlack <= 19) {
        var blockHealth = 100 - (percentage * 20 - howManyBlocksBlack) * 100
        if (blockHealth > 87.5) {
          blocks[howManyBlocksBlack].style.background = '#c21856'
        } else if (blockHealth > 75) {
          blocks[howManyBlocksBlack].style.background = '#ac154c'
        } else if (blockHealth > 62.5) {
          blocks[howManyBlocksBlack].style.background = '#971243'
        } else if (blockHealth > 50) {
          blocks[howManyBlocksBlack].style.background = '#811039'
        } else if (blockHealth > 37.5) {
          blocks[howManyBlocksBlack].style.background = '#6c0d30'
        } else if (blockHealth > 25) {
          blocks[howManyBlocksBlack].style.background = '#560a26'
        } else if (blockHealth > 12.5) {
          blocks[howManyBlocksBlack].style.background = '#40081c'
        } else {
          blocks[howManyBlocksBlack].style.background = '#2b0513'
        }
      }

      // Set colors of dead blocks
      for (var i = 0; i < howManyBlocksBlack; i++) {
        blocks[i].style.background = "#150209";
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
 * Fills placeholder for new date
 */
function fillPlaceholdersForNewDeadline() {
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

  updateNewDeadlineDate()
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
    var deadlineData = data.val()

    // Create new deadline
    var newDeadline = document.createElement('li')
    newDeadline.classList.add('deadline')
    newDeadline.classList.add('card')

    newDeadline.id = data.key
    newDeadline.setAttribute('end_date', deadlineData.end_date)
    newDeadline.setAttribute('creation_date', deadlineData.creation_date)

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
    } else if (deadlineData.display == 'bar') {
      newDeadline.classList.add('display-bar')
      newDeadline.innerHTML = `
      ${ deadlineData.task }
      <button id="remove-deadline" onclick="removeDeadline('${ data.key }')">
        <i class="material-icons">delete</i>
      </button>
      <div class="end_date"></div>
      <div class="bar">
        <div class="bar-fill"></div>
      </div>
      `
    }  else if (deadlineData.display == 'blocks') {
      newDeadline.classList.add('display-blocks')
      newDeadline.innerHTML = `
      ${ deadlineData.task }
      <button id="remove-deadline" onclick="removeDeadline('${ data.key }')">
        <i class="material-icons">delete</i>
      </button>
      <div class="end_date"></div>
      <div class="blocks">
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
        <div class="block"></div>
      </div>
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

/*
 * Add deadline by form
 */
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

/*
 * Set new deadline date from code
 */
function setNewDeadlineDay(date) {
  document.getElementById('deadline-day').value = date.date()
  document.getElementById('deadline-month').value = date.format('MM')
  document.getElementById('deadline-year').value = date.year()
  document.getElementById('deadline-hour').value = date.hours()
  document.getElementById('deadline-minute').value = date.format('mm')

  updateNewDeadlineDate()
}

var dateShortcutsCreated = false
function createDateShortcuts() {
  if (dateShortcutsCreated) {
    return
  }
  createDateShortcutElement('End of day', function () {
    setNewDeadlineDay(moment().endOf('day'))
  })
  createDateShortcutElement('Tomorrow', function () {
    setNewDeadlineDay(moment().add(1, 'days'))
  })
  createDateShortcutElement('3 days', function () {
    setNewDeadlineDay(moment().add(3, 'days'))
  })
  createDateShortcutElement('End of week', function () {
    setNewDeadlineDay(moment().endOf('week'))
  })
  createDateShortcutElement('1 week', function () {
    setNewDeadlineDay(moment().add(1, 'weeks'))
  })
  createDateShortcutElement('End of month', function () {
    setNewDeadlineDay(moment().endOf('month'))
  })
  createDateShortcutElement('1 month', function () {
    setNewDeadlineDay(moment().add(1, 'months'))
  })
  dateShortcutsCreated = true
}

function createDateShortcutElement(name, listener) {
  var dateSuggestions = document.getElementsByClassName('date-suggestions')[0]
  var newDateSuggestion = document.createElement('div')
  newDateSuggestion.innerHTML = name
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
