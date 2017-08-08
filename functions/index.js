const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

function hours(hours) {
  return 3600 * hours * 1000; // Miliseconds
}

function days(days) {
  return hours(24) * days;
}

/*
 * Those rules defines how new notification will be scheduled.
 * max_delta - the maximum difference between end date and current time
 * the smallest correct max_delta is executed
 * new_time - defines when will be next notification called
 */
const rules = [
  {
    'max_delta': hours(1),
    'new_time': 'end'
  },
  {
    'max_delta': hours(6),
    'new_time': hours(1)
  },
  {
    'max_delta': hours(24),
    'new_time': hours(12),
  },
  {
    'max_delta': days(7),
    'new_time': days(1),
  },
  {
    'max_delta': days(365),
    'new_time': days(3),
  },
  {
    'max_delta': Infinity,
    'new_time': days(7)
  }
]

function getNextTime(end_date) {
  var now = new Date().getTime()
  var delta = end_date - now

  for (rule of rules) {
    if (rule.max_delta > delta) {
      if (rule.new_time == 'end') {
        return end_date
      }
      return now + rule.new_time
    }
  }
}

exports.deadlineDeleted = functions.database.ref('/deadlines/{uid}/{did}')
    .onDelete(event => {
      var uid = event.params.uid;
      var did = event.params.did;
      var nid = uid + '----' + did;

      return admin.database().ref('/notifications/' + nid).remove()
    });

exports.deadlineUpdated = functions.database.ref('/deadlines/{uid}/{did}')
    .onUpdate(event => {
      var uid = event.params.uid;
      var did = event.params.did;
      var nid = uid + '----' + did;

      var createNotification = admin.database().ref('/notifications/' + nid).set({
        uid: uid,
        did: did,
        time: getNextTime(event.data.val().end_date)
      });

      return createNotification
    });

exports.deadlineCreated = functions.database.ref('/deadlines/{uid}/{did}')
    .onCreate(event => {
      var uid = event.params.uid;
      var did = event.params.did;
      var nid = uid + '----' + did;

      var createNotification = admin.database().ref('/notifications/' + nid).set({
        uid: uid,
        did: did,
        time: getNextTime(event.data.val().end_date)
      });

      return createNotification;
    })
