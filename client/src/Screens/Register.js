import React, { useState } from 'react';
import authSvg from '../assets/auth.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isAuth } from '../helpers/auth'; 
// authenticate,
import axios from 'axios';
import { Redirect } from 'react-router-dom';

const Register = () => {
  const [FormData, setFormData] = useState({
    name: '',
    email: '',
    password1: '',
    password2: '',
  });
  const { name, email, password1, password2 } = FormData;

  // Handle change from inputs
  const handleChange = (text) => (e) => {
    setFormData({ ...FormData, [text]: e.target.value });
  };
  // Submit data to backend
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && password1) {
      if (password1 === password2) {
        setFormData({ ...FormData });
        axios
          .post(`${process.env.REACT_APP_API_URL}/register`, {
            name,
            email,
            password: password1,
          })
          .then((res) => {
            setFormData({
              ...FormData,
              name: '',
              email: '',
              password1: '',
              password2: '',
            });

            toast.success(res.data.message);
          })
          .catch((err) => {
            setFormData({
              ...FormData,
              name: '',
              email: '',
              password1: '',
              password2: '',
            });
            console.log(err);
            // toast.error(err.response.data.errors);
          });
      } else {
        toast.error("Passwords don't matches");
      }
    } else {
      toast.error('Please fill all fields');
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      {isAuth() ? <Redirect to="/" /> : null}
      <ToastContainer />
      <div className="max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Sing Up for Future
            </h1>
            <form
              className="w-full flex-1 mt-8 text-indigo-500"
              onSubmit={handleSubmit}
            >
              <div className="mx-auto max-w-xs relative">
                <input
                  type="text"
                  placeholder="Name"
                  onChange={handleChange('name')}
                  value={name}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                />
                <input
                  type="email"
                  placeholder="Email"
                  onChange={handleChange('email')}
                  value={email}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                />
                <input
                  type="password"
                  placeholder="Password"
                  onChange={handleChange('password1')}
                  value={password1}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  onChange={handleChange('password2')}
                  value={password2}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                />
                <button
                  type="submit"
                  className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700"
                >
                  Register
                </button>
              </div>
              <div className="my-12 border-t text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign with email or social login
                  <div className="flex flex-col items-center ">
                    <a
                      href="/login"
                      className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline hover:shadow-sm focus:shadow-outline mt-5"
                    >
                      {' '}
                      Sign In
                    </a>
                  </div>
                </div>
              </div>
            </form>
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

export default Register;
