import React, { useState, useEffect, useRef } from 'react';
import * as faceApi from 'face-api.js';
import '../assets/style.css';
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { authenticate, isAuth } from '../helpers/auth';

const VideoReg = () => {

  const informParent = (res) => {
    authenticate(res, () => {
      console.log(isAuth())
      isAuth() && isAuth.role === 'admin'
        ? history.push('/admin')
        : history.push('/private');
    });
  };
  

  const history = useHistory();
  const [name, setName] = useState('');
  const [labelDescriptors, setLabelDescriptors] = useState([]);

  const init = () => {
    document.getElementById('check').disabled = false;
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `${process.env.REACT_APP_URL}/models`;

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

  let image;
  let canvas;
  const onChange = async (e) => {
    const faceMatcher = new faceApi.FaceMatcher(labelDescriptors, 0.6);
    if (image) image.remove();
    if (canvas) canvas.remove();
    image = await faceApi.bufferToImage(
      document.getElementById('recognition').files[0]
    );

    document.getElementById('recognition').parentElement.append(image);
    canvas = faceApi.createCanvasFromMedia(image);
    canvas.id = 'absolu';

    document
      .getElementById('recognition')
      .parentElement.insertBefore(
        canvas,
        document.getElementById('recognition').parentElement.childNodes[2]
          .nextSibling
      );

    const displaySize = { width: image.width, height: image.height };
    faceApi.matchDimensions(canvas, displaySize);

    const detections = await faceApi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceApi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceApi.draw.DrawBox(box, {
        label: result.toString(),
      });

      drawBox.draw(canvas);
      if (drawBox.options.label.split(' ')[0] !== 'unknown') {
        
        axios.post(`${process.env.REACT_APP_API_URL}/checkLogin`, {
          name,
        }).then((res) => {
         informParent(res);
        }).catch((err) => {
          console.log(err)
        })
      
      }
    });
  };

  const onChange2 = (event) => {
    setName(event.target.value);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (document.getElementById('check_text').value != '') {
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/check`, {
          name,
        });

        const { url } = res.data;

        const descriptions = [];
        // image from firebase
        faceApi.fetchImage(url).then(async (response) => {
          const detections = await faceApi
            .detectAllFaces(response)
            .withFaceLandmarks()
            .withFaceDescriptors();

          descriptions.push(detections[0].descriptor);

          const labelDescriptorsValue = new faceApi.LabeledFaceDescriptors(
            name,
            descriptions
          );

          console.log(labelDescriptorsValue);
          setLabelDescriptors(labelDescriptorsValue);
          document.getElementById('recognition').style.display = 'block';
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div id="aapp">
      <form onSubmit={onSubmit}>
        <input type="file" id="recognition" onChange={onChange} />
        <input
          id="check_text"
          type="text"
          className="px-4 py-2 rounded-l-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          onChange={onChange2}
          placeholder="Enter your name and surname"
        />

        <button
          id="check"
          className="px-4 py-2 rounded-r-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="submit"
          disabled
        >
          Check Face <i className="far fa-smile-wink"></i>
        </button>
      </form>
    </div>
  );
};

export default VideoReg;
