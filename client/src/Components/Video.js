import React, { useState, useEffect, useRef } from 'react';
import * as faceApi from 'face-api.js';
import '../assets/style.css'

function Video() {

  const videoWidth = 640;
  const videoHeight = 480;

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

  const [initialize, setInitialize] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

  return (
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
            <i class="far fa-picture"></i>
          </div>
          <span className="ml-4">Take Picture</span>
        </button>
      <canvas className="positioningREG" ref={canvasRef} />
    </div>
  );
}

export default Video;
