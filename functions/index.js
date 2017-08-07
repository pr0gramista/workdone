const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.deadlineDeleted = functions.database.ref('/deadlines/{uid}/{did}')
    .onDelete(event => {
      var uid = event.params.uid;
      var did = event.params.did;
      var nid = uid + '|' + did;

      return admin.database().ref('/notifications/' + nid).remove()
    });

exports.deadlineUpdated = functions.database.ref('/deadlines/{uid}/{did}')
    .onUpdate(event => {
      var uid = event.params.uid;
      var did = event.params.did;
      var nid = uid + 'x' + did;

      var createNotification = admin.database().ref('/notifications/').push().set({
        uid: uid,
        did: did,
        time: event.data.val().end_date
      });

      return admin.database().ref('/notifications/' + nid).remove().then(createNotification)
    });

exports.deadlineCreated = functions.database.ref('/deadlines/{uid}/{did}')
    .onCreate(event => {
      var uid = event.params.uid;
      var did = event.params.did;
      var nid = uid + 'x' + did;

      var createNotification = admin.database().ref('/notifications/' + nid).set({
        uid: uid,
        did: did,
        time: event.data.val().end_date
      });
      return createNotification;
    })
