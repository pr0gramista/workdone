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

function addDeadlineElement(data) {
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
}

function removeDeadlineElement(data) {
  var element = document.getElementById(data.key)
  if (element != null) {
    element.remove()
  }
}
