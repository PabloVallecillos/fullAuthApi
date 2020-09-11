import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import Progress from './Progress';
import '../assets/style.css';
import { isAuth, getCookie, signout } from '../helpers/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { storage } from '../firebase';

const FileUpload = ({ history }) => {
  const [isShown, setIsShown] = useState(false);
  const [imageProfile, setImageProfile] = useState('');
  const [file, setFile] = useState('');
  const [fileName, setFileName] = useState('Choose File');
  const [uploadedFile, setUploadedFile] = useState({});

  const [uploadPercentage, setUploadPercentage] = useState(0);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = () => {
    const token = getCookie('token');
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/${isAuth()._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        const { image } = res.data;

        setImageProfile(image.src);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err);
        // toast.error(`Error To Your Information ${err.response.statusText}`);
        if (!err) {
          if (err.response.status === 401) {
            signout(() => {
              history.push('/login');
            });
          }
        }
      });
  };

  const onChange = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const onSubmit = async (e) => {
    const token = getCookie('token');

    e.preventDefault();

    const uploadTask = storage
      .ref(`${isAuth().name}/profileImage/${fileName}`)
      .put(file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadPercentage(progress)
      },
      (error) => {
        console.log(error);
      },
      () => {
        storage
          .ref(`${isAuth().name}/profileImage`)
          .child(fileName)
          .getDownloadURL()
          .then(async (url) => {
            
            try{
              const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/upload`,
                { url },
                { 
                  headers: {
                  Authorization: `Bearer ${token}`
                  },
                  onDownloadProgress: (progressEvent) => {
                    setUploadPercentage(
                      parseInt(
                        Math.round(
                          (progressEvent.loaded * 100) / progressEvent.total
                        )
                      )
                    );
                    setTimeout(() => setUploadPercentage(0), 5000);
                  },
                }
              );
              const { filePath } = res.data;
              setImageProfile(filePath)
            } catch (err) {
              console.log(err)
            }
          });
      }
    );
  };
  return (
    <Fragment>
      <>
        <div className="flex flex-wrap justify-center">
          <img
            onMouseEnter={() => setIsShown(true)}
            onMouseLeave={() => setIsShown(false)}
            alt=""
            src={`${imageProfile}`}
            className="shadow-xl rounded-full border-none miorounder"
          />
          {isShown && (
            <svg
              className="plus_mio"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          )}

          <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
            <div className="py-6 px-3 mt-32 sm:mt-0">
              <button
                className="bg-pink-500 active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1"
                type="button"
                style={{ transition: 'all .15s ease' }}
              >
                Connect
              </button>
            </div>
          </div>
          <div className="w-full lg:w-4/12 px-4 lg:order-1">
            <div className="flex justify-center py-4 lg:pt-4 pt-8">
              <div className="mr-4 p-3 text-center">
                <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                  22
                </span>
                <span className="text-sm text-gray-500">Friends</span>
              </div>
              <div className="mr-4 p-3 text-center">
                <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                  10
                </span>
                <span className="text-sm text-gray-500">Photos</span>
              </div>
              <div className="lg:mr-4 p-3 text-center">
                <span className="text-xl font-bold block uppercase tracking-wide text-gray-700">
                  89
                </span>
                <span className="text-sm text-gray-500">Comments</span>
              </div>
            </div>
          </div>
        </div>
      </>
      <form
        className=" border border-dashed-100 text-center flex-col z-40"
        onSubmit={onSubmit}
      >
        <div className="flex flex-wrap justify-center">
          <div className="w-full lg:w-9/12 px-4 flex justify-center ">
            <label className="items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white fileUpload">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
              </svg>
              <span className="mt-2 text-base leading-normal">{fileName}</span>
              <input type="file" onChange={onChange} className="hidden" />
            </label>

            <button
              href="#pablo"
              className="bg-pink-500 active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none"
              type="submit"
            >
              Upload
            </button>

            <Progress percentage={uploadPercentage} />
          </div>
        </div>
      </form>
    </Fragment>
  );
};

export default FileUpload;
