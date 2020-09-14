import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import axios from 'axios';
import { authenticate, isAuth } from '../helpers/auth';

export default function GoogleLogin({ history }) {
  

  const handleSubmitGoogle = () => {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.

        // The signed-in user info.
        firebase
          .auth()
          .currentUser.getIdToken()
          .then(function (idToken) {
            axios
              .post(`${process.env.REACT_APP_API_URL}/googlelogin`, {
                idToken: idToken,
              })
              .then((res) => {
                console.log(JSON.stringify(res));
                informParent(res);
              })
              .catch((err) => {
                alert(err);
                console.log(err)
              });
          })
          .catch(function (error) {
            console.log(error);
          });

        // var user = result.user;
        // console.log('firebase  ' + user)
        // // ...
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const informParent = (res) => {
    authenticate(res, () => {
      isAuth() && isAuth.role === 'admin'
        ? history.push('/admin')
        : history.push('/private');
    });
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log(user);
      } else {
        console.log('no user');
      }
    });
  }, []);

  return (
    <button
      className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
      onClick={handleSubmitGoogle}
    >
      Login google
    </button>
  );
}