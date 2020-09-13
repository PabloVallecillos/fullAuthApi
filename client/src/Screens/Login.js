import React, { useState } from 'react';
import authSvg from '../assets/sign.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authenticate, isAuth } from '../helpers/auth';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
// import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import open from '../assets/open.svg';
import close from '../assets/close.svg';
import '../assets/style.css';
import Video from '../Components/Video';
import FacebookLogin from 'react-facebook-login';

const Login = ({ history }) => {
  const [isTrue, setItTrue] = useState(false);

  const [FormData, setFormData] = useState({
    email: '',
    password1: '',
  });

  const { email, password1 } = FormData;

  // Handle change from inputs
  const handleChange = (text) => (e) => {
    setFormData({ ...FormData, [text]: e.target.value });
  };

  // Submit data to backend
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password1) {
      setFormData({ ...FormData });
      axios
        .post(`${process.env.REACT_APP_API_URL}/login`, {
          email,
          password: password1,
        })
        .then((res) => {
          authenticate(res, () => {
            setFormData({
              ...FormData,
              email: '',
              password1: '',
            });

            console.log(res.data);
          });
          isAuth() && isAuth().role === 'admin'
            ? history.push('/admin')
            : history.push('/private');
          toast.success(`Hey ${res.data.user.name}, welcome back!`);
        })
        .catch((err) => {
          setFormData({
            ...FormData,
            name: '',
            email: '',
            password1: '',
            password2: '',
          });
          // console.log(err.response);
          // toast.error(err.response.data.error);
          console.log(err);
        });
    } else {
      toast.error('Please fill all fields');
    }
  };
  const fuck = (e) => {
    let password = e.target.nextSibling;

    if (password.type === 'password') {
      password.type = 'text';
      e.target.src = open;
    } else {
      password.type = 'password';
      e.target.src = close;
    }
  };
  const sendFacebookToken = (userID, accessToken) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/facebooklogin`, {
        userID,
        accessToken,
      })
      .then((res) => {
        console.log(res.data);
        informParent(res);
      })
      .catch((error) => {
        console.log('GOOGLE SIGNIN ERROR', error.response);
      });
  };
  const sendGoogleToken = (tokenId) => {
    console.log(tokenId);
    axios
      .post(`${process.env.REACT_APP_API_URL}/googlelogin`, {
        idToken: tokenId,
      })
      .then((res) => {
        console.log(res.data);
        informParent(res);
      })
      .catch((err) => {
        toast.error('GOOGLE SIGNIN ERROR', err.response);
      });
  };

  const informParent = (res) => {
    authenticate(res, () => {
      isAuth() && isAuth.role === 'admin'
        ? history.push('/admin')
        : history.push('/private');
    });
  };
  const responseGoogle = (res) => {
    console.log(res);
    sendGoogleToken(res.tokenId);
  };
  const responseFacebook = (response) => {
    console.log(response);
    sendFacebookToken(response.userID, response.accessToken);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      {isAuth() ? <Redirect to="/" /> : null}
      <ToastContainer />
      <div className="max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Sing In for Future
            </h1>
            <form
              className="w-full flex-1 mt-8 text-indigo-500"
              onSubmit={handleSubmit}
            >
              <div className="mx-auto max-w-xs relative">
                <input
                  type="email"
                  placeholder="Email"
                  onChange={handleChange('email')}
                  value={email}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                />
                <img
                  alt=""
                  className=" absolute right-0 mio"
                  id="mioClose"
                  src={close}
                  onClick={fuck}
                />
                <input
                  type="password"
                  placeholder="Password"
                  onChange={handleChange('password1')}
                  value={password1}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  id="hidePassword"
                />
                <button
                  type="submit"
                  className="mt-10 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700"
                >
                  Sign in
                </button>
                <a
                  href="/user/password/forget"
                  className="no-underline hover:underline text-indigo-500 text-md text-right absolute right-0 mt-2"
                >
                  Forgot Password?
                </a>
                <div className="flex flex-col items-center ">
                  <a
                    href="/register"
                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline hover:shadow-sm focus:shadow-outline mt-5"
                  >
                    Sign up
                  </a>
                </div>
              </div>

              <div className="my-5 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign In with social networks
                </div>
              </div>
            </form>

            <div className="flex flex-col items-center">
              <GoogleLogin
                clientId={`${process.env.REACT_APP_GOOGLE_CLIENT_ID}`}
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy={'single_host_origin'}
                render={(renderProps) => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                  >
                    <div className=" p-2 rounded-full ">
                      <i className="fab fa-google " />
                    </div>
                    <span className="ml-4">Sign In with Google</span>
                  </button>
                )}
              ></GoogleLogin>
              {/* <FacebookLogin
                appId={`${process.env.REACT_APP_FACEBOOK_CLIENT}`}
                autoLoad={false}
                callback={responseFacebook}
                render={(renderProps) => (
                  <button
                    onClick={renderProps.onClick}
                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5"
                  >
                    <div className=" p-2 rounded-full ">
                      <i className="fab fa-facebook" />
                    </div>
                    <span className="ml-4">Sign In with Facebook</span>
                  </button>
                )}
              /> */}

              <FacebookLogin
              appId={`${process.env.REACT_APP_FACEBOOK_CLIENT}`}
              autoLoad={true}
              fields="name,email,picture"
              callback={responseFacebook} /> 

              <button
                onClick={() => {
                  setItTrue(true);
                }}
                className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5"
              >
                <div className=" p-2 rounded-full ">
                  <i class="far fa-smile-wink"></i>
                </div>
                <span className="ml-4">Sign In with Face Recognition</span>
              </button>
              {isTrue && (
                <div className="modalmio">
                  <div className="squaremio">
                    <h1>FACE RECOGNITION</h1>

                    <Video />
                  </div>
                  <div className="squaremio2"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${authSvg})` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
