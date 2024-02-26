import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebase = {
  apiKey: "AIzaSyDUUDWhY-snCpjzFmRYexB-nIjLhaCL5lE",
  authDomain: "erp-notification-7f538.firebaseapp.com",
  projectId: "erp-notification-7f538",
  storageBucket: "erp-notification-7f538.appspot.com",
  messagingSenderId: "915474299878",
  appId: "1:915474299878:web:304e1c66465560d2ebb427",
  measurementId: "G-9MD1Z24DEH",
};
export const app = initializeApp(firebase);
export const messaging = getMessaging(app);
