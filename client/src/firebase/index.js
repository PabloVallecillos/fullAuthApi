import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDvsYfTNG_etDqjx9ksTOvg_htmjXvuCRo',
  authDomain: 'uploadherokufirebase.firebaseapp.com',
  databaseURL: 'https://uploadherokufirebase.firebaseio.com',
  projectId: 'uploadherokufirebase',
  storageBucket: 'uploadherokufirebase.appspot.com',
  messagingSenderId: '406024019693',
  appId: '1:406024019693:web:865678135cd310588176e4',
  measurementId: 'G-W0V7NFJ7NJ',
};

firebase.initializeApp(firebaseConfig)

const storage = firebase.storage();

export {storage, firebase as default}