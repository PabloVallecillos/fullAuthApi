import cookie from 'js-cookie';

// Set in Cookie
export const setCookie = (key, value) => {
  if (window !== 'undefiend') {
    cookie.set(key, value, {
      // 1 day
      expires: 1,
    });
  }
};

// Remove from Cookie
export const removeCookie = (key) => {
  if (window !== 'undefiend') {
    cookie.remove(key, {
      // 1 day
      expires: 1,
    });
  }
};

// Get from Cookie like token
export const getCookie = (key) => {
  if (window !== 'undefiend') {
    return cookie.get(key);
  }
};

// Set in localStorage to
export const setLocalStorage = (key, value) => {
  if (window !== 'undefiend') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Remove from localStorage
export const removeLocalStorage = (key) => {
  if (window !== 'undefiend') {
    localStorage.removeItem(key);
  }
};

// Auth user after login
export const authenticate = (response, next) => {
  setCookie('token', response.data.token);
  setLocalStorage('user', response.data.user);
  next();
};

// Singout
export const signout = next => {
    removeCookie('token');
    removeLocalStorage('user');
    // next();
};

// Access user info from localstorage
export const isAuth = () => {
  if (window !== 'undefined') {
      const cookieChecked = getCookie('token');
      if (cookieChecked) {
          if (localStorage.getItem('user')) {
              return JSON.parse(localStorage.getItem('user'));
          } else {
              return false;
          }
      }
  }
};


// Update user data in localStorage
export const updateUser = (response, next) => {
  if (window !== 'undefiend') {
    let auth = JSON.parse(localStorage.getItem('user'));
    auth = response.data;
    localStorage.setItem('user', JSON.stringify(auth));
  }
  next();
};
