importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-database.js');

var config = {
  apiKey: "AIzaSyAQH_mzKLGnD7a-MubUxR-zz0AmNGpH2PQ",
  authDomain: "workdone-160900.firebaseapp.com",
  databaseURL: "https://workdone-160900.firebaseio.com",
  projectId: "workdone-160900",
  storageBucket: "workdone-160900.appspot.com",
  messagingSenderId: "753972019068"
};
firebase.initializeApp(config);

const messaging = firebase.messaging();
