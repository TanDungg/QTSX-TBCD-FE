import React, { useRef, useEffect, useState } from "react";

const ImageCanvas = ({ imageUrl }) => {
  const canvasRef = useRef();
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const imageObj = new window.Image();
    imageObj.src = imageUrl;

    imageObj.onload = () => {
      context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
    };
  }, [imageUrl]);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    updateCirclePosition(e);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    updateCirclePosition(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const updateCirclePosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCirclePosition({ x, y });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    const imageObj = new window.Image();
    imageObj.src = imageUrl;
    imageObj.onload = () => {
      context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
      if (isDrawing) {
        context.beginPath();
        context.arc(circlePosition.x, circlePosition.y, 20, 0, 2 * Math.PI);
        context.fillStyle = "rgba(255, 0, 0, 0.5)";
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = "red";
        context.stroke();
      }
    };
  }, [imageUrl, isDrawing, circlePosition]);

  return (
    <canvas
      // style={{
      //   border: "1px #333 solid",
      // }}
      ref={canvasRef}
      width={600}
      height={300}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};

export default ImageCanvas;
