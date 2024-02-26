importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);
//the Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyDUUDWhY-snCpjzFmRYexB-nIjLhaCL5lE",
  authDomain: "erp-notification-7f538.firebaseapp.com",
  projectId: "erp-notification-7f538",
  storageBucket: "erp-notification-7f538.appspot.com",
  messagingSenderId: "915474299878",
  appId: "1:915474299878:web:304e1c66465560d2ebb427",
  measurementId: "G-9MD1Z24DEH",
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
    title: payload.notification.title,
  };
  if (notificationOptions.title === "LogOut") {
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => {
        for (let client of clients) {
          client.postMessage({ action: "deleteCookie" });
        }
      });
  } else {
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => {
        for (let client of clients) {
          client.postMessage({ action: "Notification" });
        }
      });
    self.registration.showNotification(
      notificationOptions.title,
      notificationOptions
    );
  }
});
