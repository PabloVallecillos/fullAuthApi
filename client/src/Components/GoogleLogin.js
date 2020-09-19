import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import axios from 'axios';
import { authenticate, isAuth } from '../helpers/auth';
import { useHistory } from "react-router-dom";

const GoogleLogin = () => {

  const informParent = (res) => {
    authenticate(res, () => {
      console.log(isAuth())
      isAuth() && isAuth.role === 'admin'
        ? history.push('/admin')
        : history.push('/private');
    });
  };
  
  const history = useHistory();

  const handleSubmitGoogle = () => {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        
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
                console.log(err)
              });
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  

  return (
    <button
      className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
      onClick={handleSubmitGoogle}
    >
      Login google
    </button>
  );
}
export default GoogleLogin