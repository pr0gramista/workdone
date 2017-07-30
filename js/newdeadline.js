/*
 * Add new deadline modal functions
 */
function showNewDeadlineModal() {
  document.getElementById('new-deadline').classList.add('show')
}

function hideNewDeadlineModal() {
  document.getElementById('new-deadline').classList.remove('show')
  document.getElementById('new-deadline-slider').style.left = "0"
}

/*
 * Initialize slider
 */
function intializeNewDeadlineSlider() {
  newDeadlineSlider = document.getElementById('new-deadline-slider')
  sliderButtons = newDeadlineSlider.getElementsByClassName('next-slide')
  _.forEach(sliderButtons, function (button) {
    button.addEventListener('click', function () {
      newDeadlineSlider.style.left = (button.getAttribute('left') * -100) + '%'
    })
  })
}
intializeNewDeadlineSlider()

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

/*
 * Creating date shortcuts
 */
var dateShortcutsCreated = false
function createDateShortcuts() {
  function createDateShortcutElement(name, listener) {
    var dateSuggestions = document.getElementsByClassName('date-suggestions')[0]
    var newDateSuggestion = document.createElement('div')
    newDateSuggestion.innerHTML = name
    newDateSuggestion.classList.add('date-suggestion')
    newDateSuggestion.addEventListener('click', listener)
    dateSuggestions.append(newDateSuggestion)
  }

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

/*
 * Add deadline by form
 */
function addDeadline() {
  var task = document.getElementById('deadline-task').value
  var display = document.querySelector('input[name="newdeadline-display"]:checked').value
  var end_date = getNewDeadlineDate()

  firebase.database().ref('deadlines/' + uid).push().set({
    task: task,
    creation_date: _.now(),
    end_date: end_date.getTime(),
    display: display
  })

  hideNewDeadlineModal()
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
