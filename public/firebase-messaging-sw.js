// importScripts(
//   "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
// );
// //the Firebase config object
// const firebaseConfig = {
//   apiKey: "AIzaSyBEbTPnUhp6VPXJ3dmtEm5iyYmKw8e54wc",
//   authDomain: "qlcntt-bf148.firebaseapp.com",
//   projectId: "qlcntt-bf148",
//   storageBucket: "qlcntt-bf148.appspot.com",
//   messagingSenderId: "225281522710",
//   appId: "1:225281522710:web:bd0549cc29ec8651850937",
//   measurementId: "G-FPFFK6EWTV",
// };
// firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: payload.notification.image,
//     title: payload.notification.title,
//   };
//   if (notificationOptions.title === "LogOut") {
//     self.clients
//       .matchAll({ includeUncontrolled: true, type: "window" })
//       .then((clients) => {
//         for (let client of clients) {
//           client.postMessage({ action: "deleteCookie" });
//         }
//       });
//   } else {
//     self.clients
//       .matchAll({ includeUncontrolled: true, type: "window" })
//       .then((clients) => {
//         for (let client of clients) {
//           client.postMessage({ action: "Notification" });
//         }
//       });
//     self.registration.showNotification(
//       notificationOptions.title,
//       notificationOptions
//     );
//   }
// });
