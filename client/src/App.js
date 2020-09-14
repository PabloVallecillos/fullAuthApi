import React from 'react';
import { updateUser, isAuth, getCookie, signout } from './helpers/auth'

function App({ history }) {
  console.log(history)

  const handleLogout = () => {
    signout(() => {
      history.push('/login');
    })
  }
  
  return (
    <div className="App">
      {!isAuth() && 
        <a
          href="login"
        >
          login
        </a>
      }
      
      <a
          className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3
    bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5"
          href="/"
          target="_self"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-in-alt fa 1x w-6  -ml-2 text-indigo-500" />
                  <span className="ml-4">Sign out</span>
        </a>
    </div>
  );
}

export default App;
