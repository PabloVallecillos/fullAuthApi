import React, { useState, useEffect, useRef } from 'react';
import * as faceApi from 'face-api.js';
import '../assets/style.css';
import Progress from './Progress';
import { storage } from '../firebase';
import axios from 'axios';

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
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const [file, setFile] = useState('');
  const [fileName, setFileName] = useState('Choose File');

  const [FormData, setFormData] = useState({
    name: '',
  });

  const { name } = FormData;

  const onChange = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };
  // Handle change from inputs
  const handleChange = (text) => (e) => {
    setFormData({ ...FormData, [text]: e.target.value });
  };

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
    if (canvasRefPicture.current) {
      canvasRefPicture.current
        .getContext('2d')
        .drawImage(videoRef.current, 0, 0, 640, 480);
      document.getElementById('download').style.display = 'block';
      document.getElementById('download2').style.display = 'block';
    }
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
        if (canvasRef.current) {
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
          if (canvasRef.current) {
            canvasRef.current
              .getContext('2d')
              .clearRect(0, 0, videoWidth, videoHeight);
            faceApi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceApi.draw.drawFaceLandmarks(
              canvasRef.current,
              resizedDetections
            );
            faceApi.draw.drawFaceExpressions(
              canvasRef.current,
              resizedDetections
            );
          }
        }

        // alert(detections);
      } catch (err) {
        alert(err);
      }
    }, 100);
  };

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
      document.getElementById('nofile3').style.display = 'block';
      // console.log(detections.length)
      const resizedDetections = faceApi.resizeResults(detections, displaySize);
      resizedDetections.forEach((detection) => {
        const box = detection.detection.box;
        const drawBox = new faceApi.draw.DrawBox(box, { label: 'Face' });
        drawBox.draw(canvas);
      });
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const uploadTask = storage
      .ref(`${name}_REG/profileImageREG/${fileName}`)
      .put(file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadPercentage(progress);
      },
      (error) => {
        console.log(error);
      },
      () => {
        storage
          .ref(`${name}_REG/profileImageREG`)
          .child(fileName)
          .getDownloadURL()
          .then(async (url) => {
            try {
              const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/uploadFace`,
                { url, name },
                {
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
            } catch (err) {
              console.log(err);
            }
          });
      }
    );
  };

  return (
    <div>
      <div id="nofile">
        Upload file
        <form onSubmit={onSubmit}>
          <input id="upload" type="file" onChange={onChange}></input>
          <input
            id="nofile3"
            type="text"
            placeholder="Enter your fuck name"
            onChange={handleChange('name')}
          />
          <Progress percentage={uploadPercentage} />
          <button type="submit" id="nofile2">
            UploadImage and then sign in
          </button>
        </form>
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
