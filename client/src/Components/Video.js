import React, { useState, useEffect, useRef } from 'react';
import * as faceApi from 'face-api.js';
import '../assets/style.css';
import Progress from './Progress'
import { storage } from '../firebase';

function Video() {

  const videoWidth = 640;
  const videoHeight = 480;
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const [initialize, setInitialize] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const canvasRefPicture = useRef();
  const snap = useRef();
  const [uploadPercentage,setUploadPercentage] = useState(0)

  const constraints = {
    audio: false,
    video: {
      width: videoWidth,
      height: videoHeight,
    },
  };

  function handleSuccess(stream) {
    window.stream = stream;
    videoRef.current.srcObject = stream;
  }

  async function init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      handleSuccess(stream);
    } catch (err) {
      console.error(err);
    }
  }

  // Draw Image
  var button = document.createElement('button');

  const handleCaptureVideo = (e) => {
    canvasRefPicture.current
      .getContext('2d')
      .drawImage(videoRef.current, 0, 0, 640, 480);
    document.getElementById('download').style.display = 'block';
    document.getElementById('download2').style.display = 'block';
  };

  // download canvas
  const download_img = (el) => {
    el.target.href = canvasRefPicture.current.toDataURL('image/png');
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `${process.env.REACT_APP_URL}/models`;
      setInitialize(true);

      Promise.all([
        faceApi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceApi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceApi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceApi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceApi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        faceApi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      ])
        .then(init)
        .catch((err) => console.log(err));
    };
    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handelVideoOnPlay = () => {
    setInterval(async () => {
      if (initialize) {
        setInitialize(false);
      }
      try {
        canvasRef.current.innerHTML = faceApi.createCanvasFromMedia(
          videoRef.current
        );

        const displaySize = {
          width: videoWidth,
          height: videoHeight,
        };

        faceApi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceApi
          .detectAllFaces(
            videoRef.current,
            new faceApi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceApi.resizeResults(
          detections,
          displaySize
        );
        canvasRef.current
          .getContext('2d')
          .clearRect(0, 0, videoWidth, videoHeight);
        faceApi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceApi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        faceApi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

        // alert(detections);
      } catch (err) {
        alert(err);
      }
    }, 100);
  };

  // const uploadFirebase = () => {
  //   const uploadTask = storage
  //     .ref(`${isAuth().name}/profileImage/${fileName}`)
  //     .put(file);

  //   uploadTask.on(
  //     'state_changed',
  //     (snapshot) => {
  //       const progress = Math.round(
  //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100
  //       );
  //       setUploadPercentage(progress);
  //     },
  //     (error) => {
  //       console.log(error);
  //     },
  //     () => {
  //       storage
  //         .ref(`${isAuth().name}/profileImage`)
  //         .child(fileName)
  //         .getDownloadURL()
  //         .then(async (url) => {
  //           try {
  //             const res = await axios.post(
  //               `${process.env.REACT_APP_API_URL}/upload`,
  //               { url },
  //               {
  //                 headers: {
  //                   Authorization: `Bearer ${token}`,
  //                 },
  //                 onDownloadProgress: (progressEvent) => {
  //                   setUploadPercentage(
  //                     parseInt(
  //                       Math.round(
  //                         (progressEvent.loaded * 100) / progressEvent.total
  //                       )
  //                     )
  //                   );
  //                   setTimeout(() => setUploadPercentage(0), 5000);
  //                 },
  //               }
  //             );
  //             const { filePath } = res.data;
  //             setImageProfile(filePath);
  //           } catch (err) {
  //             console.log(err);
  //           }
  //         });
  //     }
  //   );
  // };

  const uploadImg = (e) => {
    document.getElementById('nofile').style.display = 'block';
    e.target.parentElement.parentElement.remove();
    document.getElementById('upload').addEventListener('change', async () => {
      const image = await faceApi.bufferToImage(
        document.getElementById('upload').files[0]
      );
      const canvas = faceApi.createCanvasFromMedia(image);
      canvas.id = 'absolu';

      document.getElementById('upload').parentElement.append(canvas);
      const displaySize = { width: image.width, height: image.height };
      faceApi.matchDimensions(canvas, displaySize);

      const detections = await faceApi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();
      document.getElementById('upload').parentElement.append(image);
      document.getElementById('nofile2').style.display = 'block';
      // console.log(detections.length)
      const resizedDetections = faceApi.resizeResults(detections, displaySize);
      resizedDetections.forEach((detection) => {
        const box = detection.detection.box;
        const drawBox = new faceApi.draw.DrawBox(box, { label: 'Face' });
        drawBox.draw(canvas);
      });
    });
  };

  // const onSubmit = async (e) => {
  //   // const token = getCookie('token');

  //   e.preventDefault();

  //   const uploadTask = storage
  //     .ref(`${name}/profileImageREG/${fileName}`)
  //     .put(file);

  //   // uploadTask.on(
  //   //   'state_changed',
  //   //   (snapshot) => {
  //   //     const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
  //   //     setUploadPercentage(progress)
  //   //   },
  //   //   (error) => {
  //   //     console.log(error);
  //   //   },
  //   //   () => {
  //   //     storage
  //   //       .ref(`${name}/profileImageREG`)
  //   //       .child(fileName)
  //   //       .getDownloadURL()
  //   //       .then(async (url) => {
            
  //   //         try{
  //   //           const res = await axios.post(
  //   //             `${process.env.REACT_APP_API_URL}/upload`,
  //   //             { url },
  //   //             { 
  //   //               headers: {
  //   //               // Authorization: `Bearer ${token}`
  //   //               },
  //   //               onDownloadProgress: (progressEvent) => {
  //   //                 setUploadPercentage(
  //   //                   parseInt(
  //   //                     Math.round(
  //   //                       (progressEvent.loaded * 100) / progressEvent.total
  //   //                     )
  //   //                   )
  //   //                 );
  //   //                 setTimeout(() => setUploadPercentage(0), 5000);
  //   //               },
  //   //             }
  //   //           );
  //   //           const { filePath } = res.data;
  //   //           // setImageProfile(filePath)
  //   //         } catch (err) {
  //   //           console.log(err)
  //   //         }
  //   //       });
  //   //   }
  //   // );
  // };

  return (
    <div>
      <div id="nofile">
        Upload file

        {/* <form
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
      </form> */}
         <input id="upload" type="file"></input>
        
         <button id="nofile2" >    
          {' '}
          UploadImage and then sign in{' '}
        </button>
      </div>
      <div className="videoReg">
        <video
          className="videoClass"
          ref={videoRef}
          width="640"
          height="480"
          playsInline
          autoPlay
          onPlay={handelVideoOnPlay}
        ></video>
        <button
          onClick={() => {
            //
          }}
          className="miobutn"
        >
          <div className=" p-2 rounded-full ">
            <i className="far fa-picture"></i>
          </div>
          <span className="ml-4" onClick={handleCaptureVideo}>
            {' '}
            Take Picture
          </span>
          <span className="ml-4">{initialize ? 'Initializing' : 'Ready'}</span>
        </button>
        <canvas className="positioningREG" ref={canvasRef} />

        {/* <!-- Webcam video snapshot  --> */}
        <div className="canvasAppend">
          <canvas
            ref={canvasRefPicture}
            className="mediaCanvas"
            width="640"
            height="480"
          ></canvas>
          <a
            id="download"
            download="myImage.jpg"
            onClick={download_img}
            href=""
          >
            Download to myImage.jpg
          </a>
          <button id="download2" onClick={uploadImg}>
            UploadImage
          </button>
        </div>
      </div>
    </div>
  );
}

export default Video;
