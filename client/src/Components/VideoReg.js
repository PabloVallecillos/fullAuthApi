import React, { useState, useEffect, useRef } from 'react';
import * as faceApi from 'face-api.js';
import '../assets/style.css';
import axios from 'axios';

import firebase from '../firebase';

function VideoReg() {
  const [name, setName] = useState('');
  const [labelDescriptors, setLabelDescriptors] = useState([]);

  const init = () => {
    document.getElementById('aapp').append('loaded');
  };

  useEffect(() => {
    //  const storage =  firebase.app().storage('gs://uploadherokufirebase.appspot.com').ref('Carlo Vallecillos Moya_REG')
    //  console.log(storage)

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

  const onChange = async (e) => {
    const faceMatcher = new faceApi.FaceMatcher(labelDescriptors, 0.6);

    const image = await faceApi.bufferToImage(
      document.getElementById('recognition').files[0]
    );

    document.getElementById('recognition').parentElement.append(image);
    const canvas = faceApi.createCanvasFromMedia(image);
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
    });
  };

  const onChange2 = (event) => {
    setName(event.target.value);

    document.getElementById('check').style.display = 'block';
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/check`, {
        name,
      });

      const { url } = res.data;

      const descriptions = [];
      // image from firebase
      const img = faceApi.fetchImage(url).then(async (response) => {
        const detections = await faceApi
          .detectAllFaces(response)
          .withFaceLandmarks()
          .withFaceDescriptors();

        descriptions.push(detections[0].descriptor);

        const labelDescriptorsValue = new faceApi.LabeledFaceDescriptors(
          name,
          descriptions
        );

        setLabelDescriptors(labelDescriptorsValue);
      });

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div id="aapp">
      <form onSubmit={onSubmit}>
        <input type="file" id="recognition" onChange={onChange} />
        <input type="text" onChange={onChange2} />

        <button id="check" type="submit">
          Check Face with REG
        </button>
      </form>
    </div>
  );
}

export default VideoReg;
