"use client"
// components/ImageUploader.js
import React, { useState, useEffect, useRef } from 'react';
import BoundingBox from './BoundingBox';
import axios from 'axios';  // HTTP client library


const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [boxes, setBoxes] = useState([]);  // Existing state for bounding boxes
  const [startPoint, setStartPoint] = useState(null);
  const [currentBox, setCurrentBox] = useState(null);
  const [currentTag, setCurrentTag] = useState("None"); // New state variable for current tag

  const imgRef = useRef(null);  // Reference to the img element


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (!startPoint) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const box = {
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
    };

    setCurrentBox(box);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    if (currentBox) {
      setBoxes([...boxes, { ...currentBox, tag: currentTag }]);
    }
    setStartPoint(null);
    setCurrentBox(null);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [startPoint, currentBox, boxes]);

  const handleTagChange = (e) => {
    setCurrentTag(e.target.value);
  };



  const saveAnnotation = async () => {
    const annotationData = {
      image_name: "some_image_name.jpg",
      annotation_data: JSON.stringify({ boxes, tags: boxes.map(() => currentTag) }) // Save tags with boxes
    };
    try {
      const response = await axios.post("http://localhost:5000/upload_annotation", annotationData);
      if (response.status === 201) {
        alert("Successfully saved annotation");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save annotation");
    }

  };


  return (
    <div>
      <h1>Image Annotation Tool</h1>

      <select onChange={handleTagChange}>
        <option value="None">None</option>
        <option value="Dog">Dog</option>
        <option value="Cat">Cat</option>
        <option value="Car">Car</option>
        // Add more options as needed
      </select>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      <div style={{ position: 'relative' }}>
        {image && <img ref={imgRef} src={image} alt="Uploaded preview" onMouseDown={handleMouseDown} />}
        {currentBox && <BoundingBox {...currentBox} />}
        {boxes.map((box, index) => <BoundingBox key={index} {...box} />)}
      </div>
      <button onClick={saveAnnotation}>Save Annotation</button>
    </div>
  );
};


export default ImageUploader;
